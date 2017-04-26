import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class Scraps {
    constructor(scrapID) {
      this.scraps = [];
      let username = Cookies.get('username');

      httpClient.fetch('http://remix.ist:8000/scraps/' + username)
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
            { route: ['newscrap'], name: 'newscrap', moduleId: 'pages/editscrap/newscrap', nav: true, title: 'New Scrap' },
            { route: 'search', name: 'search', moduleId: 'pages/myscraps/search', nav: true, title: 'Search' },
        ]);
        this.router = router;
    }
}
