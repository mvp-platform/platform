var path = require('path');
var nodegit = require('nodegit');
var promisify = require('es6-promisify');
var fs = require('fs-extra');
var lockFile = require('lockfile');

var ensureDir = promisify(fs.mkdirs);
var stat = promisify(fs.stat);
var readFile = promisify(fs.readFile);

var addAndCommit = async function (repo, user, msg) {
	var parents = [];
	try {
		var head = await nodegit.Reference.nameToId(repo, 'HEAD');
		var parent = await repo.getCommit(head);
		parents = [parent]
	} catch (err) {}

	let index = await repo.refreshIndex();
	await index.addAll();
	await index.write();
	let oid = await index.writeTree();

	var sig = nodegit.Signature.now(user.username, user.email);
 	let commitId = await repo.createCommit('HEAD', sig, sig, msg, oid, parents);
	return commitId;
};

var commit = async function (dir, user, msg) {
	var repo = await nodegit.Repository.open(path.resolve(dir, '.git'));
	return addAndCommit(repo, user, msg);
}

var getFileFromCommit = async function (dir, filename, sha) {
	// get the info.json file from the dir given a certain sha
	let fileContents = {};
	try {
		let repo = await nodegit.Repository.open(path.resolve(dir, '.git'));
		let err = await repo.setHeadDetached(sha);
	  let ref = await repo.getCurrentBranch();
		console.log("On " + ref.toString() + " " + ref.target());
		var rf = await readFile(dir + filename, 'utf8');
		fileContents = JSON.parse(rf);
	} finally {
		// reset HEAD to master
		let err = await repo.setHead('master');
		return fileContents;
	}
}

var getHead = async function (dir) {
	var repo = await nodegit.Repository.open(path.resolve(dir, '.git'));
	var head = await nodegit.Reference.nameToId(repo, 'HEAD');
	var parent = await repo.getCommit(head);
	return parent;
}

var createRepo = async function (dir, user, msg) {
	// creates the directory, initializes the repo
	return ensureDir(dir)
	.then(function () {
		return nodegit.Repository.init(dir, 0);
	})
	.then(function (repo) {
		return addAndCommit(repo, user, msg);
	}).catch(function (err) {
		console.log('error creating repo:', err);
	});
}

module.exports = {
  // opens the repo, gets the HEAD commit
	commit: commit,
	getFileFromCommit: getFileFromCommit,
	createRepo: createRepo,
	getHead: getHead,

	createAndCommit: async function (dir, user, msg) {
		if (msg === undefined) {
			msg = 'update repository'
		}
		let stats;
		try {
			stats = await stat(dir + '/.git');
			// if stat doesn't throw, the git directory already exists
			return commit(dir, user, msg);
		} catch (err) {
			// else, create the new repo and commit
			return createRepo(dir, user, msg);
		}
	}
};
