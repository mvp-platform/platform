import { HttpClient, json } from 'aurelia-fetch-client';
import { Cookies } from 'aurelia-plugins-cookies';

const httpClient = new HttpClient();

export class Books {
  favorite(book) {
    var authToken = "Token " + Cookies.get('token');
    let method;
    if (document.getElementById("fav" + book.author + book.uuid + "-icon").innerHTML === "favorite_border") {
      // add to favorites
      document.getElementById("fav" + book.author + book.uuid + "-icon").innerHTML = "favorite";
      method = 'post';
    } else {
      // remove from favorites
      document.getElementById("fav" + book.author + book.uuid + "-icon").innerHTML = "favorite_border";
      method = 'delete';
    }
    // add to favs or remove from favs
    httpClient.fetch('https://remix.ist/books/' + book.author + '/' + book.uuid + '/favorite', {
      method: method,
      headers: {
        'Authorization': authToken
      }
    });
}

  constructor() {
    this.title = "My Books";
    this.books = [];
    const username = Cookies.get('username');

    httpClient.fetch(`https://remix.ist/books/${username}`)
      .then(response => response.json())
      .then((data) => {
        for (const instance of data) {
          this.books.push(instance);
        }
      });
  }

  configureRouter(config, router) {
    config.title = 'Right Tabs';
    config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'search', settings: { type: 'book', myStuff: true }, moduleId: 'pages/search/search', nav: true, title: 'Search' },
    ]);
    this.router = router;
  }

}
