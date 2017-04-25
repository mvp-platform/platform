'use strict';

var git = require("../git/git");
var chapter = require("./chapter");
var path = require("path");
var ncp_cb = require('ncp').ncp;
var promisify = require("es6-promisify");
const mkdirp = require('mkdirp');
const mkdirpp = promisify(mkdirp);
var ncp = promisify(ncp_cb);
var stringify = require('json-stable-stringify');
var fs = require('fs-extra');
var ensureDir = promisify(fs.mkdirs);
var writeFile = promisify(fs.writeFile);
var readFile = promisify(fs.readFile);
var mustache = require("mustache");

fs.readFile = promisify(fs.readFile);

const uuidV4 = require('uuid/v4');

var reconstitute = async function (author, uuid, sha) {
  var data = {};
  if (sha !== null && sha !== undefined) {
    var dir = global.storage + author + '/book/' + uuid;
    dir = path.resolve(process.env.PWD, dir);
    data = JSON.parse(await git.getFileFromCommit(dir, 'info.json', sha));
  } else {
    data = JSON.parse(await readFile(global.storage + author + '/book/' + uuid + '/info.json', 'utf8'));
  }
  return new Book(data.name, data.author, data.uuid, data.chapters, data.oldAuthors);
}

var Book = function(bookName, authorName, uuid, chapters, oldAuthors) {
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

Book.prototype.getText = async function() {
  let runningText = "";
  let authors = [this.author];
  if (this.oldAuthors !== undefined) {
    authors = authors.concat(this.oldAuthors);
  }
  for (let c of this.chapters) {
    let nc = await chapter.reconstitute(c[0], c[1], c[2]);
    let [cText, cAuthors] = await nc.getText();
    authors = authors.concat(cAuthors);
    runningText = runningText + cText + "\n";
  }
  return [runningText, new Set(authors)];
}

Book.prototype.addChapter = function(chapter, sha) {
  if (sha == undefined) {
    sha = chapter.head
  }
  this.chapters.push([chapter.author, chapter.uuid, sha, chapter.name]);
};

Book.prototype.removeChapter = function(chapterName) {
  var index = this.chapters.indexOf(chapterName);
  this.chapters.splice(index, 1);
};

Book.prototype.setChapters = function(chapters) {
  this.chapters = chapters;
};

let shaMatch = new RegExp("^[0-9a-f]{5,40}$");

var validateChapters = async function(chapters) {
  var correctChapters = [];
  var truths = await Promise.all(chapters.map(async (ch) => {
    try {
      let nc = await chapter.reconstitute(ch[0], ch[1]);
      if (ch[2] != null && !(shaMatch.test(ch[2]))) {
        throw "sha must be either null or a valid sha!";
      }
      if (ch.length != 3) {
        throw "bad length, should have three items";
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
}

let chapterDiff = async function(newRef, old) {
  // newRef = [[author, uuid, sha], [author, uuid, sha]]
  // old = [[author, uuid, sha, name], [author, uuid, sha, name]]

  let running = "Updated chapters: ";
  let oldComp = old.map(e => e[0] + "," + e[1]); // join would give all elements; we don't want that
  let newComp = newRef.map(e => e[0] + "," + e[1]);

  for (let i in oldComp) {
    if (!newComp.includes(oldComp[i])) {
      running = running + "Removed chapter " + old[i][3] + "; ";
    }
  }

  for (let i in newComp) {
    if (!oldComp.includes(newComp[i])) {
      let c = await chapter.reconstitute(newRef[i][0], newRef[i][1]);
      running = running + "Added chapter " + c.name; + "; ";
    }
  }
  return running.slice(0, -2) + '. ';
}

Book.prototype.update = async function(diff) {
  var success = true;
  var updateMsg = "update: ";
  for (var field in diff) {
    if (field === "name") {
      updateMsg += "changed name from " + this.name + " to " + diff[field] + ". ";
      this.name = diff[field];
    } else if (field === "author" || field === "uuid") {
      success = false;
      return JSON.stringify({error: "author and uuid are read-only", field: field});
    } else if (field === "chapters") {
      updateMsg += await chapterDiff(diff['chapters'], this.chapters);
      this.chapters = await validateChapters(diff["chapters"]);
      if (this.chapters === false) {
        return JSON.stringify({error: "invalid chapters field", field: field});
      }
    } else {
      success = false;
      return JSON.stringify({error: "unrecognized field " + field, field: field});
    }
  }
  var updateBlock = await this.save(updateMsg);
  updateBlock.message = updateMsg;
  return updateBlock;
}

Book.prototype.previousVersions = function(numVersions) {
  return git.getParents(global.storage + this.author + '/book/' + this.uuid);
  // return list of previous versions as a [[hash, commit message], ...]
}

Book.prototype.save = function(reason) {
  // save new version with commit message `reason`
  var u = {};
  u.email = "test@test.com";
  u.username = this.author;
  var commitMessage = reason;
  var dir = global.storage + u.username + '/book/' + this.uuid;

  var book = this;

  // TODO sane place to book chapters
  dir = path.resolve(process.env.PWD, dir)

  return ensureDir(dir)
  .then(function() {
    return writeFile(path.join(dir, "info.json"), stringify(book, {space: '  '}));
  }).then(function() {
    if (book.isNew) {
      delete book.isNew;
      return git.createRepo(dir, u, commitMessage);
    } else {
      delete book.isNew;
      return git.commit(dir, u, commitMessage);
    }
  });
}

Book.prototype.getBySha = async function(hash) {
  // get old version of book
  var dir = global.storage + this.author + '/book/' + this.uuid;
  dir = path.resolve(process.env.PWD, dir)
  return await git.getFileFromCommit(dir, 'info.json', hash);
}

Book.prototype.fork = async function(newUser) {
  await mkdirpp(global.storage + newUser + '/scrap/');
  // fork book to another user's directory
  var err = await ncp(global.storage + this.author + '/book/' + this.uuid, global.storage + newUser + '/book/' + this.uuid);
  var newBook = await reconstitute(newUser, this.uuid);
  newBook.author = newUser;
  if (!newBook.oldAuthors) {
    newBook.oldAuthors = [this.author];
  } else {
    newBook.oldAuthors.push(this.author);
  }
  newBook.author = newUser;
  await newBook.save('forked from ' + this.author);
  return newBook;
}

module.exports = {
  Book: Book,
  reconstitute: reconstitute
}
