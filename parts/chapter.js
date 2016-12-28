var git = require("../git/git");
var path = require("path");
var promisify = require("promisify-node");
var stringify = require('json-stable-stringify');
var fs = require('fs');
var fse = promisify(require("fs-extra"));

const uuidV4 = require('uuid/v4');

var Chapter = function(chapterName) {
  this.name = chapterName;
  this.scraps = [];
  this.isNew = true;
  this.uuid = uuidV4();
};

Chapter.prototype.addScrap = function(scrapName) {
  this.scraps.push(scrapName);
};

Chapter.prototype.removeScrap = function(scrapName) {
  var index = this.scraps.indexOf(scrapName);
  this.scraps.splice(index, 1);
};

Chapter.prototype.setScraps = function(scraps) {
  this.scraps = scraps;
};

Chapter.prototype.previousVersions = function(numVersions) {
  // TODO
  // return list of previous versions as a [[hash, commit message], ...]
}

Chapter.prototype.save = function(reason) {
  // save new version with commit message `reason`
  var u = {};
  u.email = "test@test.com";
  u.username = "testuser";
  var commitMessage = reason;
  var dir = u.username + '/chapter/' + this.uuid;

  var chapter = this;

  // TODO sane place to chapter chapters
  dir = path.resolve(process.env.PWD, dir)

  return fse.ensureDir(dir)
  .then(function() {
    return fse.writeFile(path.join(dir, "info.json"), stringify(chapter, {space: '  '}))
  }).then(function() {
    if (chapter.isNew) {
      chapter.isNew = false;
      return git.createRepo(dir, u, commitMessage);
    } else {
      console.log(chapter.isNew);
      return git.commit(dir, u, commitMessage);
    }
  });
}

Chapter.prototype.getBySha = function(hash) {
  // get old version of chapter
  // TODO
}

Chapter.prototype.fork = function(newUser) {
  // fork chapter to another user's directory
}

module.exports = Chapter;
