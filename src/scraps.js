'use strict';

const scrap = require('../../scrapjs/parts/scrap');
const mustache = require('mustache');
const pdf = require('./pdf');

const scrapTmpl = `

\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\begin{document}
{{ body }}
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
	var scr = new scrap.Scrap("", request.payload.author);
  await scr.save('Created new scrap');
  return reply(scr);
}

const routes = [{
    method: 'GET',
    path: '/scraps/{author}/{id}',
    handler: getScrapById
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
