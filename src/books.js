'use strict';

const book = require('../../scrapjs/parts/book');
const mustache = require('mustache');
const pdf = require('./pdf');

const bookTmpl = `

\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\title{ {{title}} }
\\author{ {{author}} }
\\date{ }

\\begin{document}

\\maketitle

\\tableofcontents

{{ body }}
\\end{document}
`

const getBookById = async function(request, reply) {
  var b = await book.reconstitute(request.params.author, request.params.id);
  return reply(b);
}

const postBookById = async function(request, reply) {
  var b = await book.reconstitute(request.params.author, request.params.id);
  var err = await b.update(request.payload);
  return reply(err);
}

const generateBookPdf = async function(request, reply) {
  const b = await book.reconstitute(request.params.author, request.params.id);

	const bookText = await b.getText();
	const info = {
		title: b.name,
		author: b.author,
		body: bookText
	};
	const laText = mustache.render(bookTmpl, info); // lol laText
  const pdfPath = await pdf.gen(laText);

  return reply.file(pdfPath);
}

const getBookHistory = async function(request, reply) {
  const b = await book.reconstitute(request.params.author, request.params.id);
  const versions = await b.previousVersions();
  return reply(versions.map(function(v) { return [v[0], v[1]] })); // remove the Commit object field
}

const postNewBook = async function(request, reply) {
  // TODO verify author
  if (request.payload.author === undefined) {
    return reply({error: "must define author"}).code(404);
  }
	var bk = new book.Book(request.payload.name, request.payload.author);
  await bk.save('Created book named ' + request.payload.name);
  return reply(bk);
}

const routes = [
  {
    method: 'GET',
    path: '/books/{author}/{id}',
    handler: getBookById
  },
  {
    method: 'POST',
    path: '/books/{author}/{id}',
    handler: postBookById
  },
  {
    method: 'GET',
    path: '/books/{author}/{id}/pdf',
    handler: generateBookPdf
  },
  {
    method: 'GET',
    path: '/books/{author}/{id}/history',
    handler: getBookHistory
  },
  {
    method: 'POST',
    path: '/books/new',
    handler: postNewBook
  }
];

const register = function(server) {
  for (let route of routes) {
    server.route(route);
  }
}

module.exports = {register: register};
