var git = require("../git/git");
var path = require("path");
var promisify = require("promisify-node");
var stringify = require('json-stable-stringify');
var fs = require('fs');
var fse = promisify(require("fs-extra"));

const uuidV4 = require('uuid/v4');

var Book = function(bookName) {
  this.name = bookName;
  this.chapters = [];
  this.isNew = true;
  this.hash = uuidV4();
};

Book.prototype.addChapter = function(chapterName) {
  this.chapters.push(chapterName);
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
  u.username = "testuser";
  var commitMessage = reason;
  var dir = u.username + '/' + this.hash;

  var book = this;

  // TODO sane place to book books
  dir = path.resolve(process.env.PWD, dir)

  return fse.ensureDir(dir)
  .then(function() {
    return fse.writeFile(path.join(dir, "info.json"), stringify(book, {space: '  '}))
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

var book1 = new Book("All About Headphones");
book1.addChapter("abc123");
book1.addChapter("fed987");
console.log(book1.isNew);

book1.save("initial book commit")
.then(function(data) {
  console.log('saved book: ', data);

  // once we've saved the initial repo, add some stuff and save again
  book1.addChapter("adsfjklas");
  book1.addChapter("asdjflajkds");

  book1.save("added more")
  .then(function(data) { console.log('saved book: ', data); })
  .catch(console.error);
})
.catch(console.error);
