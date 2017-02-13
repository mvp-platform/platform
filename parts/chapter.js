'use strict';

var scrap = require("./scrap");
var path = require("path");
var promisify = require("es6-promisify");
var stringify = require('json-stable-stringify');
var fs = require('fs-extra');
var ensureDir = promisify(fs.mkdirs);
var writeFile = promisify(fs.writeFile);
var readFile = promisify(fs.readFile);
const uuidV4 = require('uuid/v4');
var git = require("../git/git");

var Chapter = function(chapterName, authorName, uuid, scraps) {
  this.name = chapterName;
  this.author = authorName;
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
}

Chapter.prototype.getText = async function() {
  var runningText = "\\newpage\n\\section{" + this.name + "}\n\n";
  for (let s of this.scraps) {
    let ns = await scrap.reconstitute(s[0], s[1]);
    runningText = runningText + ns.getText() + "\n\\newline\n";
  }
  return runningText;
}

Chapter.prototype.addScrap = function(scrap, sha) {
  if (sha == undefined) {
    sha = scrap.head
  }
  this.scraps.push([scrap.author, scrap.uuid, sha]);
};

Chapter.prototype.removeScrap = function(scrap) {
  var index = this.scraps.indexOf(scrap);
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
  u.username = this.author;
  var commitMessage = reason;
  var dir = '/tmp/mvp/' + u.username + '/chapter/' + this.uuid;

  var chapter = this;

  // TODO sane place to chapter chapters
  dir = path.resolve(process.env.PWD, dir)

  return ensureDir(dir)
  .then(function() {
    return writeFile(path.join(dir, "info.json"), stringify(chapter, {space: '  '}));
  }).then(function() {
    if (chapter.isNew) {
      chapter.isNew = false;
      return git.createRepo(dir, u, commitMessage);
    } else {
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


module.exports = {
  Chapter: Chapter,
  reconstitute: async function(author, uuid, sha) {
    try {
      var rf = await readFile('/tmp/mvp/' + author + '/chapter/' + uuid + '/info.json', 'utf8');
      var data = JSON.parse(rf);
      return new Chapter(data.name, data.author, data.uuid, data.scraps);
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }
}
