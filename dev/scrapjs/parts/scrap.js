const path = require('path');
const ncpCb = require('ncp').ncp;
const promisify = require('es6-promisify');
const mkdirp = require('mkdirp');
const stringify = require('json-stable-stringify');
const fs = require('fs-extra');

const uuidV4 = require('uuid/v4');
const git = require('../git/git');

const ncp = promisify(ncpCb);
const mkdirpp = promisify(mkdirp);
const ensureDir = promisify(fs.mkdirs);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const reconstitute = async function (author, uuid, sha) {
  let data = {};
  if (sha !== null && sha !== undefined) {
    let dir = `${global.storage + author}/scrap/${uuid}`;
    dir = path.resolve(process.env.PWD, dir);
    data = JSON.parse(await git.getFileFromCommit(dir, 'info.json', sha));
  } else {
    data = JSON.parse(await readFile(`${global.storage + author}/scrap/${uuid}/info.json`, 'utf8'));
  }
  return new Scrap(
    data.text,
    data.author,
    data.uuid,
    data.oldAuthors,
    data.latex,
    data.image,
    data.tags);
};

const Scrap = function (text, authorName, uuid, oldAuthors, latex, image, tags) {
  this.author = authorName;
  this.oldAuthors = oldAuthors;
  this.text = text;
  this.latex = !!latex;
  this.image = !!image;
  this.head = undefined;
  this.isNew = true;
  this.tags = tags;
  if (uuid === undefined) {
    this.uuid = uuidV4();
  } else {
    this.uuid = uuid;
  }
};

Scrap.prototype.getText = function getText() {
  if (this.oldAuthors !== undefined) {
    this.oldAuthors.push(this.author);
    return [this.text, this.oldAuthors];
  }
  return [this.text, [this.author]];
};

Scrap.prototype.setText = function setText(text) {
  this.text = text;
};

Scrap.prototype.previousVersions = function previousVersions() {
  return git.getParents(`${global.storage + this.author}/scrap/${this.uuid}`);
  // return list of previous versions as a [[hash, commit message], ...]
};

Scrap.prototype.save = function save(reason) {
  // save new version with commit message `reason`
  const u = {};
  u.email = 'test@test.com';
  u.username = this.author;
  const commitMessage = reason;
  let dir = `${global.storage + u.username}/scrap/${this.uuid}`;

  const scrap = this;

  // TODO sane place to put these
  dir = path.resolve(process.env.PWD, dir);

  return ensureDir(dir)
  .then(() => writeFile(path.join(dir, 'info.json'), stringify(scrap, { space: '  ' }))).then(() => {
    if (scrap.isNew) {
      delete scrap.isNew;
      return git.createRepo(dir, u, commitMessage);
    }
    delete scrap.isNew;
    return git.commit(dir, u, commitMessage);
  });
};

Scrap.prototype.getBySha = async function getBySha(hash) {
  // get old version of scrap
  let dir = `${global.storage + this.author}/scrap/${this.uuid}`;
  dir = path.resolve(process.env.PWD, dir);
  return git.getFileFromCommit(dir, 'info.json', hash);
};

Scrap.prototype.fork = async function fork(newUser) {
  // fork scrap to another user's directory
  await mkdirpp(`${global.storage + newUser}/scrap/`);
  await ncp(`${global.storage + this.author}/scrap/${this.uuid}`, `${global.storage + newUser}/scrap/${this.uuid}`);
  const newScrap = await reconstitute(newUser, this.uuid);
  newScrap.author = newUser;
  if (!newScrap.oldAuthors) {
    newScrap.oldAuthors = [this.author];
  } else {
    newScrap.oldAuthors.push(this.author);
  }
  newScrap.author = newUser;
  await newScrap.save(`forked from ${this.author}`);
  return newScrap;
};

Scrap.prototype.update = async function update(diff) {
  this.isNew = false;
  let updateMsg = 'update: ';
  for (const field of Object.keys(diff)) {
    if (field !== 'tags' && field !== 'text' && field !== 'latex') {
      return { error: 'invalid field', field };
    }
    if (field === 'text') {
      updateMsg = `${updateMsg}changed text from ${this.text} to ${diff.text}. `;
      this.text = diff.text;
    }
    if (field === 'latex') {
      if (diff[field] === false) {
        updateMsg = `${updateMsg}Disabled latex. `;
        this.latex = false;
      } else if (diff[field] === true) {
        updateMsg = `${updateMsg}Enabled latex. `;
        this.latex = true;
      } else {
        return { error: 'latex option must true or false', value: diff[field] };
      }
    }
    if (field === 'tags') {
      if (!Array.isArray(diff[field])) {
        return { error: 'tags must be array' };
      }
      for (const item of diff[field]) {
        if (typeof item !== 'string') {
          return { error: 'tags must only be strings' };
        }
      }
      this.tags = diff.tags;
      updateMsg = `${updateMsg}Changed tags to ${diff.tags.join(', ')}. `;
    }
  }
  const updateBlock = await this.save(updateMsg);
  updateBlock.message = updateMsg;
  return updateBlock;
};

module.exports = {
  Scrap,
  reconstitute,
};
