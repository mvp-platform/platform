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

var getParents = async function (dir, num) {
	if (num == undefined) { num = 100; }
	var parents = [];
	var com = await getHead(dir);
	parents.push([com.sha(), com.message(), com]);

	while (parents.length <= num) {
		try {
			var com = await com.parent(0);
			parents.push([com.sha(), com.message(), com]);
		} catch (e) { break; }
	}

	return parents;
}

var getFileFromCommit = async function (dir, filename, sha) {
	// get the info.json file from the dir given a certain sha
	// thar be dragons, my utmost apologies to anyone reading this
	let fileContents = {};
	let repo = await nodegit.Repository.open(path.resolve(dir, '.git'));
	let head = await repo.getReferenceCommit('refs/heads/master');
	var opts = new nodegit.CheckoutOptions();
	try {
		let commit = await nodegit.Commit.lookup(repo, sha);
		await nodegit.Reset.reset(repo, commit, nodegit.Reset.TYPE.HARD, opts, "tmpbranch");
		var rf = await readFile(dir + '/' + filename, 'utf8');
		fileContents = JSON.parse(rf);
	} catch(err) {
		console.log("Error getting old sha: ", err);
	} finally {
		await nodegit.Reset.reset(repo, head, nodegit.Reset.TYPE.HARD, opts, "master");
		return rf;
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
	getParents: getParents,

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
