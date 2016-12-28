var Book = require("./parts/book");

var book1 = new Book("All About Headphones");
book1.addChapter("abc123");
book1.addChapter("fed987");
console.log(book1.isNew);

book1.save("initial book commit")
.then(function(data) {
  console.log('saved book: ', data);
  console.log(book1);

  // once we've saved the initial repo, add some stuff and save again
  book1.addChapter("adsfjklas");
  book1.addChapter("asdjflajkds");

  book1.save("added more")
  .then(function(data) { console.log('saved book: ', data); })
  .catch(console.error);
})
.catch(console.error);
