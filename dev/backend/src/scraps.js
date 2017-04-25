'use strict';

const scrap = require('../../scrapjs/parts/scrap');
const mustache = require('mustache');
const accounts = require('./accounts');
const pdf = require('./pdf');
const fs = require('fs');
const promisify = require("es6-promisify");
const readdir = promisify(fs.readdir);
const lescape = require('escape-latex');

const scrapTmpl = `

\\documentclass{article}
\\usepackage{fontspec}
\\defaultfontfeatures{Ligatures=TeX}
\\usepackage[small,sf,bf]{titlesec}
\\usepackage{fvextra}
\\DefineVerbatimEnvironment{plainraw}
  {Verbatim}
  {fontfamily=\\rmdefault,breaklines,breaksymbolleft={}}
\\begin{document}

\\begin{plainraw}

{{{ body }}}
\\end{plainraw}
\\end{document}
`

const getUnassociatedScraps = async function(request, reply) {
  var login = await accounts.verifylogin(request, reply);
  if (!login.success) {
    return reply({error: "could not verify identity", reason: login.reason}).code(403);
  }
  var cursor = await db.collection('refs').find({author: login.username, type: "scrap", count: 0});
  var unassoc = await cursor.toArray();
  unassoc.map(function(e) {
    delete e._id;
    delete e.count;
  })
  return reply(unassoc);
}

const getScrapById = async function(request, reply) {
  var s = await scrap.reconstitute(request.params.author, request.params.id);
  return reply(s);
}

const postScrapById = async function(request, reply) {
  var login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({error: "could not verify identity"}).code(403);
  }
  if (login.username != request.params.author) {
    return reply({error: "not your scrap!"}).code(403);
  }
  if (request.payload) {
    return reply({error: "not your scrap!"}).code(403);
  }
  var s = await scrap.reconstitute(request.params.author, request.params.id);
  var err = await s.update(request.payload);
  if (err.error) {
    return reply(err).code(403);
  }
  var resp = await global.search.update({
    index: 'mvp',
    type: 'scrap',
    id: s.author + '-' + s.uuid,
    body: {
      doc: s
    }
  });
  return reply(err);
}

const generateScrapPdf = async function(request, reply) {
  const s = await scrap.reconstitute(request.params.author, request.params.id);

	const [scrapText, authors] = await s.getText();
  const authorFullNames = await accounts.fullNames(authors);
  const authorText = authorFullNames.join(' \\and ');
	const info = {
		title: lescape(s.name),
		author: authorText,
		body: scrapText // TODO better escaping!
	};
	const laText = mustache.render(scrapTmpl, info); // lol laText
  const pdfPath = await pdf.gen(laText);

  return reply.file(pdfPath);
}

const getScrapHistory = async function(request, reply) {
  const s = await scrap.reconstitute(request.params.author, request.params.id);
  const versions = await s.previousVersions();
  return reply(versions.map(function(v) { return [v[0], v[1]] })); // remove the Commit object field
}

const postNewScrap = async function(request, reply) {
  var login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({error: "could not verify identity"}).code(403);
  }
  if (request.payload.author !== login.username) {
    return reply({error: "can only create scraps for " + login.username}).code(403);
  }
  if (request.payload.author === undefined) {
    return reply({error: "must define author"}).code(404);
  }
  let text = request.payload.text;
  if (text === undefined) {
    text = "";
  }
	var scr = new scrap.Scrap(text, request.payload.author);
  await scr.save('Created new scrap');

  var resp = await global.search.create({
    index: 'mvp',
    type: 'scrap',
    id: scr.author + '-' + scr.uuid,
    body: {
      doc: scr
    }
  });
  await db.collection('refs').insertOne({author: request.payload.author, text: text, type: 'scrap', uuid: scr.uuid, count: 0});
  return reply(scr);
}

// /scraps/{author}
const getScrapsByAuthor = async function(request, reply) {
  let scraps = [];
  try {
    let dirs = await readdir(global.storage + request.params.author + '/scrap');
    for (let dir of dirs) {
      let b = await scrap.reconstitute(request.params.author, dir);
      scraps.push(b);
    }
  } catch (e) {
    // TODO should return successful but empty for existing user with no scraps
    console.error("/users/" + request.params.author + "/scraps unsuccessful", e)
    return reply({error: "no scraps for user " + request.params.author + " found"}).code(404);
  }
  return reply(scraps);
}

// /scraps/{author}/{id}/fork
const forkScrapById = async function(request, reply) {
  var login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({error: "could not verify identity"}).code(403);
  }
  const s = await scrap.reconstitute(request.params.author, request.params.id);
  const sFork = await s.fork(login.username);
  return reply(sFork);
}

// /scraps/{author}/{id}/favorite
const favoriteScrapById = async function(request, reply) {
  var login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({error: "could not verify identity"}).code(403);
  }

  return reply(await accounts.favoriteThing(login.username, 'scrap', request.params.author, request.params.id));
}

// /scraps/{author}/{id}/favorite
const unfavoriteScrapById = async function(request, reply) {
  var login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({error: "could not verify identity"}).code(403);
  }

  return reply(await accounts.unfavoriteThing(login.username, 'scrap', request.params.author, request.params.id));
}

const routes = [{
    method: 'GET',
    path: '/scraps/{author}/{id}',
    handler: getScrapById
  },
  {
    method: 'GET',
    path: '/scraps/{author}',
    handler: getScrapsByAuthor
  },
  {
    method: 'POST',
    path: '/scraps/{author}/{id}',
    handler: postScrapById
  },
  {
    method: 'POST',
    path: '/scraps/{author}/{id}/fork',
    handler: forkScrapById
  },
  {
    method: 'POST',
    path: '/scraps/{author}/{id}/favorite',
    handler: favoriteScrapById
  },
  {
    method: 'DELETE',
    path: '/scraps/{author}/{id}/favorite',
    handler: favoriteScrapById
  },
  {
    method: 'GET',
    path: '/scraps/{author}/{id}/pdf',
    handler: generateScrapPdf
  },
  {
    method: 'GET',
    path: '/scraps/unassociated',
    handler: getUnassociatedScraps
  },
  {
    method: 'GET',
    path: '/scraps/{author}/{id}/history',
    handler: getScrapHistory
  },
  {
    method: 'POST',
    path: '/scraps/new',
    handler: postNewScrap
  }
];

const register = function(server) {
  for (let route of routes) {
    server.route(route);
  }
}

module.exports = {register: register};
