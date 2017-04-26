import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class EditChapters {
    constructor() {}

    activate(author) {

        this.chapter = null;

        httpClient.fetch('http://remix.ist:8000/chapters/' + author.author + '/' + author.uuid)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.chapter = data;
            });

    }

    configureRouter(config, router) {
        config.title = 'Chapter Tabs';
        config.map([
          { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
          { route: ['newscrap', ':author/:uuid'], name: 'newscrap', moduleId: 'pages/editscrap/newscrap', nav: false, title: 'New Scrap' },
          { route: 'search', name: 'search', moduleId: 'pages/editchapter/search', nav: true, title: 'search' },
        ]);
        this.router = router;
    }
}
