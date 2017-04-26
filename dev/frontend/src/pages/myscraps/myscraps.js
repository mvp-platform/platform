import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';
import {Dragula} from 'aurelia-dragula';

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

    itemDropped(item, target, source, sibling, itemVM, siblingVM) {
      console.log(item);
    }

    configureRouter(config, router) {
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'search', moduleId: 'pages/myscraps/search', nav: true, title: 'Search' },
            { route: ['editscrap', ':author/:uuid'], name: 'editScrap', moduleId: 'pages/editscrap/editscrap', nav: true, title: 'Edit Scrap'}
        ]);
        this.router = router;
    }
}
