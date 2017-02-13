'use strict';

var git = require("../git/git");
var path = require("path");
var promisify = require("es6-promisify");
var stringify = require('json-stable-stringify');
var fs = require('fs-extra');
var ensureDir = promisify(fs.mkdirs);
var writeFile = promisify(fs.writeFile);
var readFile = promisify(fs.readFile);

const uuidV4 = require('uuid/v4');

var Scrap = function(text, authorName, uuid) {
  this.author = authorName;
  this.text = text;
  this.head = undefined;
  this.isNew = true;
  if (uuid == undefined) {
    this.uuid = uuidV4();
  } else {
    this.uuid = uuid;
  }
}

Scrap.prototype.getText = function() {
  return this.text;
};

Scrap.prototype.setText = function(text) {
  this.text = text;
};

Scrap.prototype.previousVersions = function(numVersions) {
  // TODO
  // return list of previous versions as a [[hash, commit message], ...]
}

Scrap.prototype.save = function(reason) {
  // save new version with commit message `reason`
  var u = {};
  u.email = "test@test.com";
  u.username = this.author;
  var commitMessage = reason;
  var dir = '/tmp/mvp/' + u.username + '/scrap/' + this.uuid;

  var scrap = this;

  // TODO sane place to put these
  dir = path.resolve(process.env.PWD, dir)

  return ensureDir(dir)
  .then(function() {
    return writeFile(path.join(dir, "info.json"), stringify(scrap, {space: '  '}));
  }).then(function() {
    if (scrap.isNew) {
      scrap.isNew = false;
      console.log('saving new repo at ', dir)
      return git.createRepo(dir, u, commitMessage);
    } else {
      console.log(scrap.isNew);
      return git.commit(dir, u, commitMessage);
    }
  });
}

Scrap.prototype.getBySha = function(hash) {
  // get old version of scrap
  // TODO
}

Scrap.prototype.fork = function(newUser) {
  // fork scrap to another user's directory
}

module.exports = {
  Scrap: Scrap,
  reconstitute: function(author, uuid, sha) {
    return readFile('/tmp/mvp/' + author + '/scrap/' + uuid + '/info.json', 'utf8').then(function(f) {
      // create a valid Scrap object from disk
      var data = JSON.parse(f);
      console.log("data parsed! returning scrap")
      return new Scrap(data.text, data.author, data.uuid);
    }).catch(function(e) {
      console.log(e);
    });
  }
}
