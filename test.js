'use strict'

var Book = require('./parts/book'); var chapter = require('./parts/chapter'); var scrap = require('./parts/scrap');


var foo = async function() {
var a = new scrap.Scrap('first scrap test', 'rambourg');
try {
  await a.save()
} catch (e) {
  console.log(e)
}
var b = new scrap.Scrap('second scrap', 'rambourg');
await b.save()
console.log('hi')

var ch1 = new chapter.Chapter('first chapter', 'rambourg')
ch1.addScrap(a);
ch1.addScrap(b);
try {
await ch1.save()
} catch (e) {
  console.log('nope, not working :(', e)
  process.exit()
}
console.log('wow, that worked??')


var c = new scrap.Scrap('third scrap', 'rambourg');
await c.save()
var ch2 = new chapter.Chapter('second chapter', 'rambourg')
ch2.addScrap(c)
await ch2.save()


ch1.getText().then(function(f) {
  console.log('chaptertext:\n\n', f);
}).catch(function(e) {
  console.log('chaptertext err:\n\n', e);
});

var myBook = new Book('new book', 'rambourg')
myBook.addChapter(ch1)
myBook.addChapter(ch2)

myBook.getText().then(function(f) {
  console.log("vvv THAT'S IT")
  console.log(f);
  console.log("^^^ THAT'S IT")
}).catch(function(e) {
console.log("ERR", e);
});
}

var bar = foo();
