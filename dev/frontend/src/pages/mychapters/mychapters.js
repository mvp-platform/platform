import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class Chapters {
    constructor() {
      this.chapters = [];

      httpClient.fetch('http://remix.ist:8000/chapters/dcampbell')
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
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'search', moduleId: 'pages/mychapters/search', nav: true, title: 'Search' },
        ]);
        this.router = router;
    }
}
