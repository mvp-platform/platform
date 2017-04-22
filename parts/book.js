'use strict';

var git = require("../git/git");
var chapter = require("./chapter");
var path = require("path");
var promisify = require("es6-promisify");
var stringify = require('json-stable-stringify');
var fs = require('fs-extra');
var ensureDir = promisify(fs.mkdirs);
var writeFile = promisify(fs.writeFile);
var readFile = promisify(fs.readFile);
var mustache = require("mustache");

fs.readFile = promisify(fs.readFile);

const uuidV4 = require('uuid/v4');

var Book = function(bookName, authorName, uuid, chapters) {
  this.name = bookName;
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
  for (let c of this.chapters) {
    let nc = await chapter.reconstitute(c[0], c[1]);
    let cText = await nc.getText();
    runningText = runningText + cText + "\n";
  }
  return runningText;
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

var validateChapters = async function(chapters) {
  var correctChapters = [];
  await Promise.all(chapters.map(async (ch) => {
    try {
      let nc = await chapter.reconstitute(ch[0], ch[1]);
      correctChapters.push([ch[0], ch[1], ch[2], nc.name]);
    } catch (e) {
      return false;
    }
  }));
  return correctChapters;
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
      // TODO validate chapters
      updateMsg += "updated chapters (TODO diff). ";
      this.chapters = await validateChapters(diff["chapters"]);
      if (this.chapters === false) {
        return JSON.stringify({error: "invalid chapters field (does the chapter exist?)", field: field});
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

Book.prototype.getBySha = function(hash) {
  // get old version of book
  // TODO
}

Book.prototype.fork = function(newUser) {
  // fork book to another user's directory
}

module.exports = {
  Book: Book,
  reconstitute: async function(author, uuid, sha) {
    try {
      var rf = await readFile(global.storage + author + '/book/' + uuid + '/info.json', 'utf8');
      var data = JSON.parse(rf);
      console.log(data);
      return new Book(data.name, data.author, data.uuid, data.chapters);
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }
}
