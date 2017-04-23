import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class EditBook {
    constructor() {}

    activate(author) {
        httpClient.fetch('http://remix.ist:8000/books/' + author.author + '/' + author.uuid)
            .then(response => response.json())
            .then(data => {
                this.book = data;
            });
    }

    configureRouter(config, router) {
        config.title = 'Book Tabs';
        config.map([
            { route: ['', '/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/editBook/PDFViewer', nav: true, title: 'PDF Viewer' },
            { route: ['editchapter', '/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/editchapter/PDFViewer', nav: false, title: 'PDF Viewer' },

            { route: 'search', name: 'search', moduleId: 'pages/editBook/search', nav: true, title: 'search' },
            { route: 'emails', name: 'emails', moduleId: 'pages/editBook/emails', nav: true, title: 'Emails' },
            { route: 'notifications', name: 'notifications', moduleId: 'pages/editBook/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;
    }

    // activate(params)
    // {
    //
    //     // return this.http.fetch('editbook/' + params.author)
    //     // .then(response => response.json())
    //     // .then(author => this.author = author);
    //     // alert("author = " + author);
    // }

    // activate(scrapID) {
    //   // if (bookID.author === undefined) {
    //   //     return;
    //   // }
    //   alert("here");
    //
    //   //this.url = "http://remix.ist:8000/books/" + bookID.author + '/' + bookID.uuid + '/pdf';
    //   //this.url = "http://remix.ist:8000/books/" + bookID.author + '/' + bookID.uuid + '/pdf';
    //   //document.url = this.url
    //   //document.draftUrl = this.url;
    // }
}
