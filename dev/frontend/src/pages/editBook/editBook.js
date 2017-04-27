import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class EditBook {
    constructor() {}

    activate(author) {
        httpClient.fetch('https://remix.ist/books/' + author.author + '/' + author.uuid)
            .then(response => response.json())
            .then(data => {
                this.book = data;
            });
    }

    configureRouter(config, router) {
        config.title = 'Book Tabs';
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'search', moduleId: 'pages/search/search', settings: {type: 'chapter'}, nav: true, title: 'Search' },
        ]);
        this.router = router;
    }
}
