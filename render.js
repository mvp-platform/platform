var mustache = require("mustache");
var promisify = require("es6-promisify");
var fs = require("fs-extra");

fs.readFile = promisify(fs.readFile);

fs.readFile('./templates/book.tex.tmpl', 'utf8').then(function(f) {
  console.log(f);
  var info = {
    title: "my book",
    author: "me",
    includes: "\include{ch1/ch1}"
  }
  console.log(mustache.render(f, info));
}).catch(function(e) {
  console.log("ERROR", e);
});
