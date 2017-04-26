import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class Scraps {
    constructor(scrapID) {
      this.scraps = [];

      httpClient.fetch('http://remix.ist:8000/scraps/dcampbell')
      .then(response => response.json())
      .then(data => {
          for (let instance of data) {
              this.scraps.push(instance);
          }
      });
    }

    configureRouter(config, router) {
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'search', moduleId: 'pages/myscraps/search', nav: true, title: 'Search' },
        ]);
        this.router = router;
    }
}
