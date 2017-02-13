'use strict';

var git = require("../git/git");
var chapter = require("./chapter");
var path = require("path");
var promisify = require("es6-promisify");
var stringify = require('json-stable-stringify');
var fs = require('fs-extra');
var ensureDir = promisify(fs.mkdirs);
var writeFile = promisify(fs.writeFile);
var mustache = require("mustache");

fs.readFile = promisify(fs.readFile);

const uuidV4 = require('uuid/v4');

var Book = function(bookName, authorName) {
  this.name = bookName;
  this.author = authorName;
  this.chapters = [];
  this.isNew = true;
  this.uuid = uuidV4();
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
  this.chapters.push([chapter.author, chapter.uuid, sha]);
};

Book.prototype.removeChapter = function(chapterName) {
  var index = this.chapters.indexOf(chapterName);
  this.chapters.splice(index, 1);
};

Book.prototype.setChapters = function(chapters) {
  this.chapters = chapters;
};

Book.prototype.previousVersions = function(numVersions) {
  // TODO
  // return list of previous versions as a [[hash, commit message], ...]
}

Book.prototype.save = function(reason) {
  // save new version with commit message `reason`
  var u = {};
  u.email = "test@test.com";
  u.username = this.user;
  var commitMessage = reason;
  var dir = '/tmp/' + u.username + '/book/' + this.uuid;

  var book = this;

  // TODO sane place to book chapters
  dir = path.resolve(process.env.PWD, dir)

  return ensureDir(dir)
  .then(function() {
    return writeFile(path.join(dir, "info.json"), stringify(book, {space: '  '}));
  }).then(function() {
    if (book.isNew) {
      book.isNew = false;
      return git.createRepo(dir, u, commitMessage);
    } else {
      console.log(book.isNew);
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

module.exports = Book;
