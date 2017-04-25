import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class Books {
    constructor() {
        this.books = [];

        httpClient.fetch('http://remix.ist:8000/books/hagrid')
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
            { route: ['', ':author/:uuid'], name: 'PDFViewer', moduleId: 'pages/mybooks/PDFViewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'search', moduleId: 'pages/mybooks/search', nav: true, title: 'search' },
            { route: 'emails', name: 'emails', moduleId: 'pages/mybooks/emails', nav: true, title: 'Emails' },
            { route: 'notifications', name: 'notifications', moduleId: 'pages/mybooks/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;

    }

}