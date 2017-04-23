import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class EditChapters {
    constructor() {}

    activate(author) {

        this.chapters = [];

        httpClient.fetch('http://remix.ist:8000/chapters/' + author.author + '/' + author.uuid)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.chapters.push(data);
            });

    }

    configureRouter(config, router) {
        config.title = 'Chapter Tabs';
        config.map([
            //{ route: ['', 'myscraps/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/editscrap/PDFViewer', nav: true, title: 'PDF Viewer' },
            { route: ['', ':author/:uuid'], name: 'PDFViewer', moduleId: 'pages/editchapter/PDFViewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'search', moduleId: 'pages/editchapter/search', nav: true, title: 'search' },
            { route: 'emails', name: 'emails', moduleId: 'pages/editchapter/emails', nav: true, title: 'Emails' },
            { route: 'notifications', name: 'notifications', moduleId: 'pages/editchapter/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;
    }

    // activate(params)
    // {
    //
    //     // return this.http.fetch('editchapter/' + params.author)
    //     // .then(response => response.json())
    //     // .then(author => this.author = author);
    //     // alert("author = " + author);
    // }

    // activate(scrapID) {
    //   // if (chapterID.author === undefined) {
    //   //     return;
    //   // }
    //   alert("here");
    //
    //   //this.url = "http://remix.ist:8000/chapters/" + chapterID.author + '/' + chapterID.uuid + '/pdf';
    //   //this.url = "http://remix.ist:8000/chapters/" + chapterID.author + '/' + chapterID.uuid + '/pdf';
    //   //document.url = this.url
    //   //document.draftUrl = this.url;
    // }
}
