import { HttpClient, json } from 'aurelia-fetch-client';
import { Cookies } from 'aurelia-plugins-cookies';

const httpClient = new HttpClient();

export class Books {
  constructor() {
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
