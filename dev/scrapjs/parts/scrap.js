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
	return new Scrap(data.text, data.author, data.uuid, data.oldAuthors, data.latex);
}

var Scrap = function (text, authorName, uuid, oldAuthors, latex) {
	this.author = authorName;
	this.oldAuthors = oldAuthors;
	this.text = text;
	this.latex = latex ? true : false;
	this.head = undefined;
	this.isNew = true;
	if (uuid === undefined) {
		this.uuid = uuidV4();
	} else {
		this.uuid = uuid;
	}
};

Scrap.prototype.getText = function () {
	if (this.oldAuthors !== undefined) {
		this.oldAuthors.push(this.author);
		return [this.text, this.oldAuthors];
	}
	return [this.text, [this.author]];
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
  newScrap.author = newUser;
  if (!newScrap.oldAuthors) {
    newScrap.oldAuthors = [this.author];
  } else {
    newScrap.oldAuthors.push(this.author);
  }
  newScrap.author = newUser;
  await newScrap.save('forked from ' + this.author);
  return newScrap;
}

Scrap.prototype.update = async function(diff) {
  var success = true;
	this.isNew = false;
	var updateMsg = "update: ";
	for (let field of Object.keys(diff)) {
		if (field !== "text" && field !== "latex") {
			return {error: "invalid field", field: field};
		}
		if (field === "text") {
			updateMsg = updateMsg + "changed text from " + this.text + " to " + diff.text + ". ";
			this.text = diff.text;
		}
		if (field === "latex") {
			if (diff[field] === false) {
				updateMsg = updateMsg + "Disabled latex. "
				this.latex = false;
			} else if (diff[field] === true) {
				updateMsg = updateMsg + "Enabled latex. "
				this.latex = true;
			} else {
				return {error: "latex option must true or false", value: diff[field]};
			}
		}
	}
  var updateBlock = await this.save(updateMsg);
  updateBlock.message = updateMsg;
  return updateBlock;
}

module.exports = {
	Scrap: Scrap,
	reconstitute: reconstitute
};
