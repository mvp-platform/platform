'use strict';

var mustache = require('mustache');
var promisify = require('es6-promisify');
var fs = require('fs-extra');

var Book = require('./parts/book');
var chapter = require('./parts/chapter');
var scrap = require('./parts/scrap');

var readFile = promisify(fs.readFile);

var run = async function () {
	var a = new scrap.Scrap('first scrap test', 'rambourg');
	await a.save('initial save');

	var b = new scrap.Scrap('second scrap', 'rambourg');
	await b.save('initial save');

	var ch1 = new chapter.Chapter('first chapter', 'rambourg');
	ch1.addScrap(a);
	ch1.addScrap(b);

	await ch1.save('initial save');

	var c = new scrap.Scrap('third scrap', 'rambourg');
	await c.save('initial save');
	var ch2 = new chapter.Chapter('second chapter', 'rambourg');
	ch2.addScrap(c);
	await ch2.save('initial save');

	var myBook = new Book('new book', 'rambourg');
	myBook.addChapter(ch1);
	myBook.addChapter(ch2);

	var bookText = await myBook.getText();
	var info = {
		title: myBook.name,
		author: myBook.author,
		body: bookText
	};
	console.log(mustache.render(bookTmpl, info));
};

run();

var bookTmpl = `

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
