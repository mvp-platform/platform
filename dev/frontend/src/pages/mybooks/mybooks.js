import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class Books {
    constructor() {
        this.books = [];

        httpClient.fetch('http://remix.ist:8000/books/dcampbell')
            .then(response => response.json())
            .then(data => {
                for (let instance of data) {
                    this.books.push(instance);
                }

            });

    }
    configureRouter(config, router) {
        config.title = 'Right Tabs';
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'Search', moduleId: 'pages/mybooks/search', nav: true, title: 'search' }
        ]);
        this.router = router;

    }

}
