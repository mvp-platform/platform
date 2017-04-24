'use strict';

global.storage = process.cwd() + '/test/';

var mustache = require('mustache');
var promisify = require('es6-promisify');
var fs = require('fs-extra');

var book = require('./parts/book');
var chapter = require('./parts/chapter');
var scrap = require('./parts/scrap');

var readFile = promisify(fs.readFile);

var run = async function () {
	var b = await book.reconstitute("rambourg", "d43bfb93-dd3f-43ea-bb1c-dd40c58ca2bf");
	console.log("master is", b);
	var c = await b.getBySha("625c4a217399a0296ab2a2c8f8eddc346c2ce0a1");
	console.log("old is", c);
};

run();
