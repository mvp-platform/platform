import { HttpClient, json } from 'aurelia-fetch-client';
import { Cookies } from 'aurelia-plugins-cookies';

const httpClient = new HttpClient();

export class Books {
  favorite(book) {
    var authToken = "Token " + Cookies.get('token');
    let method;
    if (!book.favorite) {
      method = 'post';
      book.favorite = true;
    } else {
      method = 'delete';
      book.favorite = false;
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
    const authToken = "Token " + Cookies.get('token');

    httpClient.fetch(`https://remix.ist/books/${username}`, {
      headers: {
        'Authorization': authToken
      }})
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
