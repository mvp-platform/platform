'use strict';

const scrap = require('../../scrapjs/parts/scrap');
const mustache = require('mustache');
const pdf = require('./pdf');
const fs = require('fs')
const promisify = require("es6-promisify");
const readdir = promisify(fs.readdir);

const scrapTmpl = `

\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\begin{document}
{{{ body }}}
\\end{document}
`

const getScrapById = async function(request, reply) {
  var s = await scrap.reconstitute(request.params.author, request.params.id);
  return reply(s);
}

const postScrapById = async function(request, reply) {
  var s = await scrap.reconstitute(request.params.author, request.params.id);
  var err = await s.update(request.payload);
  return reply(err);
}

const generateScrapPdf = async function(request, reply) {
  const s = await scrap.reconstitute(request.params.author, request.params.id);

	const scrapText = await s.getText();
	const info = {
		title: s.name,
		author: s.author,
		body: scrapText
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
  // TODO verify author
  if (request.payload.author === undefined) {
    return reply({error: "must define author"}).code(404);
  }
  let text = request.payload.text;
  if (text === undefined) {
    text = "";
  }
	var scr = new scrap.Scrap(text, request.payload.author);
  await scr.save('Created new scrap');
  return reply(scr);
}

// /scraps/{author}
const getScrapsByAuthor = async function(request, reply) {
  let scraps = [];
  try {
    let dirs = await readdir('/tmp/mvp/' + request.params.author + '/scrap');
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
    method: 'GET',
    path: '/scraps/{author}/{id}/pdf',
    handler: generateScrapPdf
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
