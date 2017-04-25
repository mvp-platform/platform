import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class Scraps {
    constructor(scrapID) {

        this.scraps = [];

        //' + chapterID.author + '/' + chapterID.uuid)
        httpClient.fetch('http://remix.ist:8000/scraps/dcampbell')
            .then(response => response.json())
            .then(data => {
                for (let instance of data) {
                    this.scraps.push(instance);
                }


            });


        // httpClient.fetch('http://remix.ist:8000/chapters/hagrid/68c47c74-f6fb-4e5b-a68c-f2c6b4265bd1')
        // .then(response => response.json())
        // .then(data => {
        //     this.chapters.push(data);
        //
        //     // for(let instance of data) {
        //     //     console.log(instance);
        //     //     this.books.push(instance);
        //     // }
        //
        // });

    }
    configureRouter(config, router) {
        config.map([
            { route: ['', ':author/:uuid'], name: 'PDFViewer', moduleId: 'pages/myscraps/PDFViewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'search', moduleId: 'pages/myscraps/search', nav: true, title: 'search' },
            { route: 'emails', name: 'emails', moduleId: 'pages/myscraps/emails', nav: true, title: 'Emails' },
            { route: 'notifications', name: 'notifications', moduleId: 'pages/myscraps/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;
    }
}
