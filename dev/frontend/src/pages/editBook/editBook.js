import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class EditBook {
    constructor() {}

    activate(author) {
        httpClient.fetch('http://remix.ist/books/' + author.author + '/' + author.uuid)
            .then(response => response.json())
            .then(data => {
                this.book = data;
            });
    }

    configureRouter(config, router) {
        config.title = 'Book Tabs';
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            
            { route: 'search', name: 'search', moduleId: 'pages/editBook/search', nav: true, title: 'search' },
            { route: 'emails', name: 'emails', moduleId: 'pages/editBook/emails', nav: true, title: 'Emails' },
            { route: 'notifications', name: 'notifications', moduleId: 'pages/editBook/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;
    }
}
