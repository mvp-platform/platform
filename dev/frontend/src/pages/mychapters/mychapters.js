import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class Chapters {
    constructor() {
        this.books = [];

        httpClient.fetch('http://remix.ist:8000/books/dcampbell')
            .then(response => response.json())
            .then(data => {
                for (let instance of data) {
                    console.log(instance);
                    this.books.push(instance);
                }

            });

    }
    configureRouter(config, router) {
        config.title = 'Chapter Tabs';
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'Search', moduleId: 'pages/mychapters/search', nav: true, title: 'search' },
        ]);
        this.router = router;
    }
}
