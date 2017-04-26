import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class Chapters {
    constructor() {
      this.chapters = [];
      let username = Cookies.get('username');

      httpClient.fetch('http://remix.ist/chapters/' + username)
      .then(response => response.json())
      .then(data => {
          for (let instance of data) {
              console.log(instance);
              this.chapters.push(instance);
          }
        });
    }

    activate(chapter) {
      console.log(chapter);
    }

    configureRouter(config, router) {
        config.title = 'Chapter Tabs';
        config.map(
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'search', moduleId: 'pages/mychapters/search', nav: true, title: 'Search' },
        ]);
        this.router = router;
    }
}
