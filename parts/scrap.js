'use strict';

var path = require('path');
var ncp_cb = require('ncp').ncp;
var promisify = require("es6-promisify");
var ncp = promisify(ncp_cb);
const mkdirp = require('mkdirp');
const mkdirpp = promisify(mkdirp);
var stringify = require('json-stable-stringify');
var fs = require('fs-extra');

const uuidV4 = require('uuid/v4');
var git = require('../git/git');

var ensureDir = promisify(fs.mkdirs);
var writeFile = promisify(fs.writeFile);
var readFile = promisify(fs.readFile);

var reconstitute = async function (author, uuid, sha) {
	var data = {};
	if (sha !== null && sha !== undefined) {
		var dir = global.storage + author + '/scrap/' + uuid;
		dir = path.resolve(process.env.PWD, dir);
		data = JSON.parse(await git.getFileFromCommit(dir, 'info.json', sha));
	} else {
		data = JSON.parse(await readFile(global.storage + author + '/scrap/' + uuid + '/info.json', 'utf8'));
	}
	return new Scrap(data.text, data.author, data.uuid);
}

var Scrap = function (text, authorName, uuid) {
	this.author = authorName;
	this.text = text;
	this.head = undefined;
	this.isNew = true;
	if (uuid === undefined) {
		this.uuid = uuidV4();
	} else {
		this.uuid = uuid;
	}
};

Scrap.prototype.getText = function () {
	return this.text;
};

Scrap.prototype.setText = function (text) {
	this.text = text;
};

Scrap.prototype.previousVersions = function(numVersions) {
  return git.getParents(global.storage + this.author + '/scrap/' + this.uuid);
  // return list of previous versions as a [[hash, commit message], ...]
}

Scrap.prototype.save = function (reason) {
  // save new version with commit message `reason`
	var u = {};
	u.email = 'test@test.com';
	u.username = this.author;
	var commitMessage = reason;
	var dir = global.storage + u.username + '/scrap/' + this.uuid;

	var scrap = this;

  // TODO sane place to put these
	dir = path.resolve(process.env.PWD, dir);

	return ensureDir(dir)
  .then(function () {
	return writeFile(path.join(dir, 'info.json'), stringify(scrap, {space: '  '}));
}).then(function () {
	if (scrap.isNew) {
		delete scrap.isNew;
		console.log("creating repo in " + dir);
		return git.createRepo(dir, u, commitMessage);
	} else {
		delete scrap.isNew;
		console.log("updating repo in " + dir);
		return git.commit(dir, u, commitMessage);
	}
});
};

Scrap.prototype.getBySha = async function (hash) {
  // get old version of scrap
  var dir = global.storage + this.author + '/scrap/' + this.uuid;
  dir = path.resolve(process.env.PWD, dir)
  return await git.getFileFromCommit(dir, 'info.json', hash);
};

Scrap.prototype.fork = async function(newUser) {
  // fork scrap to another user's directory
	await mkdirpp(global.storage + newUser + '/scrap/');
  var err = await ncp(global.storage + this.author + '/scrap/' + this.uuid, global.storage + newUser + '/scrap/' + this.uuid);
  var newScrap = await reconstitute(newUser, this.uuid);
  await newScrap.update({author: newUser});
  newScrap.author = newUser;
  return newScrap;
}

Scrap.prototype.update = async function(diff) {
  var success = true;
	this.isNew = false;
	if (Object.keys(diff).length !== 1 || Object.keys(diff)[0] != "text") { return JSON.stringify("only text field can be updated")}
  var updateMsg = "update: changed text from " + this.text + " to " + diff.text;
	this.text = diff.text;
  var updateBlock = await this.save(updateMsg);
  updateBlock.message = updateMsg;
  return updateBlock;
}

module.exports = {
	Scrap: Scrap,
	reconstitute: reconstitute
};
