'use strict';

const chapter = require('../../scrapjs/parts/chapter');
const mustache = require('mustache');
const pdf = require('./pdf');

const chapterTmpl = `

\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\title{ {{title}} }
\\author{ {{author}} }
\\begin{document}
{{{ body }}}
\\end{document}
`

const getChapterById = async function(request, reply) {
  let c = await chapter.reconstitute(request.params.author, request.params.id);
  return reply(c);
}

const postChapterById = async function(request, reply) {
  let c = await chapter.reconstitute(request.params.author, request.params.id);
  var err = await c.update(request.payload);
  return reply(err);
}

const generateChapterPdf = async function(request, reply) {
  const c = await chapter.reconstitute(request.params.author, request.params.id);

	const chapterText = await c.getText();
	const info = {
		title: c.name,
		author: c.author,
		body: chapterText
	};
	const laText = mustache.render(chapterTmpl, info); // lol laText
  const pdfPath = await pdf.gen(laText);

  return reply.file(pdfPath);
}

const getChapterHistory = async function(request, reply) {
  const c = await chapter.reconstitute(request.params.author, request.params.id);
  const versions = await c.previousVersions();
  return reply(versions.map(function(v) { return [v[0], v[1]] })); // remove the Commit object field
}

const postNewChapter = async function(request, reply) {
  // TODO verify author
  if (request.payload.author === undefined) {
    return reply({error: "must define author"}).code(404);
  }
	var ch1 = new chapter.Chapter(request.payload.name, request.payload.author);
  await ch1.save('Created chapter named ' + request.payload.name);
  return reply(ch1);
}

const routes = [{
    method: 'GET',
    path: '/chapters/{author}/{id}',
    handler: getChapterById
  },
  {
    method: 'POST',
    path: '/chapters/{author}/{id}',
    handler: postChapterById
  },
  {
    method: 'GET',
    path: '/chapters/{author}/{id}/pdf',
    handler: generateChapterPdf
  },
  {
    method: 'GET',
    path: '/chapters/{author}/{id}/history',
    handler: getChapterHistory
  },
  {
    method: 'POST',
    path: '/chapters/new',
    handler: postNewChapter
  }
];

const register = function(server) {
  for (let route of routes) {
    server.route(route);
  }
}

module.exports = {register: register};
