const git = require('../git/git');
const chapter = require('./chapter');
const path = require('path');
const ncpCb = require('ncp').ncp;
const promisify = require('es6-promisify');
const mkdirp = require('mkdirp');
const stringify = require('json-stable-stringify');
const fs = require('fs-extra');

const mkdirpp = promisify(mkdirp);
const ncp = promisify(ncpCb);
const ensureDir = promisify(fs.mkdirs);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

fs.readFile = promisify(fs.readFile);

const uuidV4 = require('uuid/v4');

const reconstitute = async function (author, uuid, sha) {
  let data = {};
  if (sha !== null && sha !== undefined) {
    let dir = `${global.storage + author}/book/${uuid}`;
    dir = path.resolve(process.env.PWD, dir);
    data = JSON.parse(await git.getFileFromCommit(dir, 'info.json', sha));
  } else {
    data = JSON.parse(await readFile(`${global.storage + author}/book/${uuid}/info.json`, 'utf8'));
  }
  return new Book(data.name, data.author, data.uuid, data.chapters, data.oldAuthors);
};

const Book = function (bookName, authorName, uuid, chapters, oldAuthors) {
  this.name = bookName;
  this.oldAuthors = oldAuthors; // authors from before forking
  this.author = authorName;
  if (uuid === undefined) {
    this.isNew = true;
    this.uuid = uuidV4();
  } else {
    this.isNew = false;
    this.uuid = uuid;
  }
  if (chapters === undefined) {
    this.chapters = [];
  } else {
    this.chapters = chapters;
  }
};

Book.prototype.getText = async function getText() {
  let runningText = '';
  let authors = [this.author];
  if (this.oldAuthors !== undefined) {
    authors = authors.concat(this.oldAuthors);
  }
  for (const c of this.chapters) {
    const nc = await chapter.reconstitute(c[0], c[1], c[2]);
    const [cText, cAuthors] = await nc.getText();
    authors = authors.concat(cAuthors);
    runningText = `${runningText + cText}\n`;
  }
  return [runningText, new Set(authors)];
};

Book.prototype.addChapter = function addChapter(ch, sha) {
  if (sha === undefined) {
    this.chapters.push([ch.author, ch.uuid, ch.head, ch.name]);
  }
  this.chapters.push([ch.author, ch.uuid, sha, ch.name]);
};

Book.prototype.removeChapter = function removeChapter(chapterName) {
  const index = this.chapters.indexOf(chapterName);
  this.chapters.splice(index, 1);
};

Book.prototype.setChapters = function setChapters(chapters) {
  this.chapters = chapters;
};

const shaMatch = new RegExp('^[0-9a-f]{5,40}$');

const validateChapters = async function (chapters) {
  const correctChapters = [];
  const truths = await Promise.all(chapters.map(async (ch) => {
    try {
      const nc = await chapter.reconstitute(ch[0], ch[1]);
      if (ch[2] !== null && !(shaMatch.test(ch[2]))) {
        throw new Error('sha must be either null or a valid sha!');
      }
      if (ch.length !== 3) {
        throw new Error('bad length, should have three items');
      }
      correctChapters.push([ch[0], ch[1], ch[2], nc.name]);
      return true;
    } catch (e) {
      return false;
    }
  }));
  if (truths.includes(false)) {
    return false;
  }
  return correctChapters;
};

const chapterDiff = async function chapterDiff(newRef, old) {
  // newRef = [[author, uuid, sha], [author, uuid, sha]]
  // old = [[author, uuid, sha, name], [author, uuid, sha, name]]

  let running = 'Updated chapters: ';
  const oldComp = old.map(e => `${e[0]},${e[1]}`); // join would give all elements; we don't want that
  const newComp = newRef.map(e => `${e[0]},${e[1]}`);

  for (const i in oldComp) {
    if (!newComp.includes(oldComp[i])) {
      running = `${running}Removed chapter ${old[i][3]}; `;
    }
  }

  for (const i in newComp) {
    if (!oldComp.includes(newComp[i])) {
      const c = await chapter.reconstitute(newRef[i][0], newRef[i][1]);
      running = `${running}Added chapter ${c.name}`; +'; ';
    }
  }
  return `${running.slice(0, -2)}. `;
};

Book.prototype.update = async function update(diff) {
  let updateMsg = 'update: ';
  for (const field in diff) {
    if (field === 'name') {
      updateMsg += `changed name from ${this.name} to ${diff[field]}. `;
      this.name = diff[field];
    } else if (field === 'author' || field === 'uuid') {
      success = false;
      return JSON.stringify({ error: 'author and uuid are read-only', field });
    } else if (field === 'chapters') {
      updateMsg += await chapterDiff(diff.chapters, this.chapters);
      this.chapters = await validateChapters(diff.chapters);
      if (this.chapters === false) {
        return JSON.stringify({ error: 'invalid chapters field', field });
      }
    } else {
      success = false;
      return JSON.stringify({ error: `unrecognized field ${field}`, field });
    }
  }
  const updateBlock = await this.save(updateMsg);
  updateBlock.message = updateMsg;
  return updateBlock;
};

Book.prototype.previousVersions = function previousVersions() {
  return git.getParents(`${global.storage + this.author}/book/${this.uuid}`);
  // return list of previous versions as a [[hash, commit message], ...]
};

Book.prototype.save = function save(reason) {
  // save new version with commit message `reason`
  const u = {};
  u.email = 'test@test.com';
  u.username = this.author;
  const commitMessage = reason;
  let dir = `${global.storage + u.username}/book/${this.uuid}`;

  const book = this;

  // TODO sane place to book chapters
  dir = path.resolve(process.env.PWD, dir);

  return ensureDir(dir)
  .then(() => writeFile(path.join(dir, 'info.json'), stringify(book, { space: '  ' }))).then(() => {
    if (book.isNew) {
      delete book.isNew;
      return git.createRepo(dir, u, commitMessage);
    }
    delete book.isNew;
    return git.commit(dir, u, commitMessage);
  });
};

Book.prototype.getBySha = async function getBySha(hash) {
  // get old version of book
  let dir = `${global.storage + this.author}/book/${this.uuid}`;
  dir = path.resolve(process.env.PWD, dir);
  await git.getFileFromCommit(dir, 'info.json', hash);
};

Book.prototype.fork = async function fork(newUser) {
  await mkdirpp(`${global.storage + newUser}/scrap/`);
  // fork book to another user's directory
  await ncp(`${global.storage + this.author}/book/${this.uuid}`, `${global.storage + newUser}/book/${this.uuid}`);
  const newBook = await reconstitute(newUser, this.uuid);
  newBook.author = newUser;
  if (!newBook.oldAuthors) {
    newBook.oldAuthors = [this.author];
  } else {
    newBook.oldAuthors.push(this.author);
  }
  newBook.author = newUser;
  await newBook.save(`forked from ${this.author}`);
  return newBook;
};

module.exports = {
  Book,
  reconstitute,
};
