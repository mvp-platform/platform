'use strict';

const book = require('../../scrapjs/parts/book');
const accounts = require('./accounts');
const mustache = require('mustache');
const pdf = require('./pdf');
const fs = require('fs')
const promisify = require("es6-promisify");
const readdir = promisify(fs.readdir);

const bookTmpl = `

\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\title{ {{{title}}} }
\\author{ {{{author}}} }
\\date{ }

\\begin{document}

\\maketitle

\\tableofcontents

{{{ body }}}
\\end{document}
`

const getBookById = async function(request, reply) {
  var b = await book.reconstitute(request.params.author, request.params.id);
  return reply(b);
}

const postBookById = async function(request, reply) {
  var login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({error: "could not verify identity", reason: login.reason}).code(403);
  }
  if (login.username != request.params.author) {
    return reply({error: "not your book!"}).code(403);
  }
  var b = await book.reconstitute(request.params.author, request.params.id);
  var err = await b.update(request.payload);
  var resp = await global.search.update({
    index: 'mvp',
    type: 'book',
    id: b.author + '-' + b.uuid,
    body: {
      doc: b
    }
  });
  return reply(err);
}

const generateBookPdf = async function(request, reply) {
  const b = await book.reconstitute(request.params.author, request.params.id);

	const [bookText, authors] = await b.getText();
  const authorFullNames = account.fullNames(authors);
  const authorText = authorFullNames.join(' \\and ');
	const info = {
		title: b.name,
		author: authorText,
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
  var login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({error: "could not verify identity"}).code(403);
  }
  // TODO verify author
  if (request.payload.author === undefined) {
    return reply({error: "must define author"}).code(404);
  }
  if (request.payload.name === undefined) {
    return reply({error: "must define name"}).code(404);
  }
	var bk = new book.Book(request.payload.name, request.payload.author);
  await bk.save('Created book named ' + request.payload.name);

  var resp = await global.search.create({
    index: 'mvp',
    type: 'book',
    id: bk.author + '-' + bk.uuid,
    body: {
      doc: bk
    }
  });
  return reply(bk);
}

// /books/{author}
const getBooksByAuthor = async function(request, reply) {
  let books = [];
  try {
    let dirs = await readdir(global.storage + request.params.author + '/book');
    for (let dir of dirs) {
      let b = await book.reconstitute(request.params.author, dir);
      books.push(b);
    }
  } catch (e) {
    // TODO should return successful but empty for existing user with no books
    console.error("/users/" + request.params.author + "/books unsuccessful", e)
    return reply({error: "no books for user " + request.params.author + " found"}).code(404);
  }
  return reply(books);
}

// /books/{author}/{id}/fork
const forkBookbyId = async function(request, reply) {
  var login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({error: "could not verify identity"}).code(403);
  }
  const b = await book.reconstitute(request.params.author, request.params.id);
  const bFork = await b.fork(login.username);
  return reply(bFork);
}

const routes = [
  {
    method: 'GET',
    path: '/books/{author}/{id}',
    handler: getBookById
  },
  {
    method: 'GET',
    path: '/books/{author}',
    handler: getBooksByAuthor
  },
  {
    method: 'POST',
    path: '/books/{author}/{id}/fork',
    handler: forkBookbyId
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
