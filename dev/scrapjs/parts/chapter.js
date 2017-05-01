

const scrap = require('./scrap');
const path = require('path');
const ncpCb = require('ncp').ncp;
const promisify = require('es6-promisify');
const mkdirp = require('mkdirp');
const lescape = require('escape-latex');
const stringify = require('json-stable-stringify');
const fs = require('fs-extra');
const uuidV4 = require('uuid/v4');
const git = require('../git/git');

const mkdirpp = promisify(mkdirp);
const ncp = promisify(ncpCb);
const ensureDir = promisify(fs.mkdirs);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const reconstitute = async function (author, uuid, sha) {
  let data = {};
  if (sha !== null && sha !== undefined) {
    let dir = `${global.storage + author}/chapter/${uuid}`;
    dir = path.resolve(process.env.PWD, dir);
    data = JSON.parse(await git.getFileFromCommit(dir, 'info.json', sha));
  } else {
    data = JSON.parse(await readFile(`${global.storage + author}/chapter/${uuid}/info.json`, 'utf8'));
  }
  return new Chapter(data.name, data.author, data.uuid, data.scraps, data.oldAuthors);
};

const Chapter = function (chapterName, authorName, uuid, scraps, authors) {
  this.name = chapterName;
  this.author = authorName;
  this.oldAuthors = authors; // previous authors from before forking
  this.head = undefined;
  this.isNew = true;
  if (uuid === undefined) {
    this.uuid = uuidV4();
  } else {
    this.uuid = uuid;
  }
  if (scraps === undefined) {
    this.scraps = [];
  } else {
    this.scraps = scraps;
  }
};

Chapter.prototype.getText = async function getText() {
  let runningText = `\\end{plainraw}\n\\newpage\n\\section{${lescape(this.name)}}\n\\begin{plainraw}\n\n`;
  let authors = [this.author];
  if (this.oldAuthors !== undefined) {
    authors = authors.concat(this.oldAuthors);
  }
  for (const s of this.scraps) {
    const ns = await scrap.reconstitute(s[0], s[1], s[2]);
    const [sText, sAuthor] = ns.getText();
    if (ns.latex) {
      runningText = `${runningText}\n\\end{plainraw}\n${sText}\n\\begin{plainraw}\n`;
    } else {
      runningText = `${runningText + sText}\n\n`;
    }

    authors = authors.concat(sAuthor);
  }
  return [runningText, Array.from(new Set(authors))];
};

Chapter.prototype.addScrap = function addScrap(scr, sha) {
  if (sha === undefined) {
    this.scraps.push([scr.author, scr.uuid, scr.head]);
  } else {
    this.scraps.push([scr.author, scr.uuid, sha]);
  }
};

Chapter.prototype.removeScrap = function removeScrap(scr) {
  const index = this.scraps.indexOf(scr);
  this.scraps.splice(index, 1);
};

Chapter.prototype.setScraps = function setScraps(scraps) {
  this.scraps = scraps;
};

Chapter.prototype.previousVersions = function previousVersions() {
  return git.getParents(`${global.storage + this.author}/chapter/${this.uuid}`);
  // return list of previous versions as a [[hash, commit message], ...]
};

Chapter.prototype.save = function save(reason) {
  // save new version with commit message `reason`
  const u = {};
  u.email = 'test@test.com';
  u.username = this.author;
  const commitMessage = reason;
  let dir = `${global.storage + u.username}/chapter/${this.uuid}`;

  const chapter = this;

  // TODO sane place to chapter chapters
  dir = path.resolve(process.env.PWD, dir);

  return ensureDir(dir)
  .then(() => writeFile(path.join(dir, 'info.json'), stringify(chapter, { space: '  ' }))).then(() => git.createAndCommit(dir, u, commitMessage));
};

Chapter.prototype.getBySha = async function getBySha(hash) {
  // get old version of chapter
  let dir = `${global.storage + this.author}/chapter/${this.uuid}`;
  dir = path.resolve(process.env.PWD, dir);
  return git.getFileFromCommit(dir, 'info.json', hash);
};

Chapter.prototype.fork = async function fork(newUser) {
  // fork chapter to another user's directory
  await mkdirpp(`${global.storage + newUser}/scrap/`);
  await ncp(`${global.storage + this.author}/chapter/${this.uuid}`, `${global.storage + newUser}/chapter/${this.uuid}`);
  const newChap = await reconstitute(newUser, this.uuid);
  if (!newChap.oldAuthors) {
    newChap.oldAuthors = [this.author];
  } else {
    newChap.oldAuthors.push(this.author);
  }
  newChap.author = newUser;
  await newChap.save(`forked from ${this.author}`);
  return newChap;
};

Chapter.prototype.getHead = function getHead() {
  return git.getHead(`${global.storage + this.author}/chapter/${this.uuid}`);
};

const shaMatch = new RegExp('^[0-9a-f]{5,40}$');

const validate = async function (scraps) {
  const correctScraps = [];
  const truths = await Promise.all(scraps.map(async (sc) => {
    try {
      await scrap.reconstitute(sc[0], sc[1]);
      if (sc[2] != null && !(shaMatch.test(sc[2]))) {
        throw new Error('sha must be either null or a valid sha!');
      }
      if (sc.length !== 3) {
        throw new Error('bad length, should have three items');
      }
      correctScraps.push([sc[0], sc[1], sc[2]]);
      return true;
    } catch (e) {
      return false;
    }
  }));
  if (truths.includes(false)) {
    return false;
  }
  return correctScraps;
};

const scrapDiff = async function (newRef, old) {
  // newRef = [[author, uuid, sha], [author, uuid, sha]]
  // old = [[author, uuid, sha], [author, uuid, sha]]

  let running = 'Updated scraps: ';
  const oldComp = old.map(e => `${e[0]},${e[1]}`); // join would give all elements; we don't want that
  const newComp = newRef.map(e => `${e[0]},${e[1]}`);

  for (const i in oldComp) {
    if (!newComp.includes(oldComp[i])) {
      const c = await scrap.reconstitute(old[i][0], old[i][1]);
      running = `${running}Removed scrap ${c.text.slice(0, 20)}; `;
    }
  }

  for (const i in newComp) {
    if (!oldComp.includes(newComp[i])) {
      const c = await scrap.reconstitute(newRef[i][0], newRef[i][1]);
      running = `${running}Added scrap ${c.text.slice(0, 20)}; `;
    }
  }
  return `${running.slice(0, -2)}. `;
};

Chapter.prototype.update = async function update(diff) {
  let updateMsg = 'update: ';
  for (const field in diff) {
    if (field === 'name') {
      updateMsg += `changed name from ${this.name} to ${diff[field]}. `;
      this.name = diff[field];
    } else if (field === 'author' || field === 'uuid') {
      success = false;
      return JSON.stringify({ error: 'author and uuid are read-only', field });
    } else if (field === 'scraps') {
      const valid = await validate(diff[field]);
      if (!valid) {
        return JSON.stringify({ error: 'invalid scraps!', field: diff[field] });
      }
      updateMsg += await scrapDiff(diff.scraps, this.scraps);
      this.scraps = diff[field];
    } else {
      success = false;
      return JSON.stringify({ error: `unrecognized field ${field}`, field });
    }
  }
  const updateBlock = await this.save(updateMsg);
  updateBlock.message = updateMsg;
  return updateBlock;
};

const fleshOut = async function (truple) {
  for (const scr in truple) {
    const s = await scrap.reconstitute(truple[scr][0], truple[scr][1], truple[scr][2]);
    truple[scr][3] = s.text;
    truple[scr][5] = s.image;
  }
  return truple;
};

module.exports = {
  Chapter,
  reconstitute,
  fleshOut,
};
