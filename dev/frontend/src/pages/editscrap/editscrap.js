import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class Scraps {
    constructor(scrapID)
    {

        this.scraps = [];

        //' + chapterID.author + '/' + chapterID.uuid)
        httpClient.fetch('http://remix.ist:8000/scraps/hagrid')
        .then(response => response.json())
        .then(data => {
            for(let instance of data) {
                console.log(instance);
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
            { route: ['', ':author/:uuid'], name: 'PDFViewer', moduleId: 'pages/editscrap/PDFViewer', nav: true, title: 'PDF Viewer' },
            { route: 'account', name: 'account', moduleId: 'pages/editscrap/account', nav: true, title: 'Account' },
            { route: 'emails', name: 'emails', moduleId: 'pages/editscrap/emails', nav: true, title: 'Emails' },
            { route: 'notifications', name: 'notifications', moduleId: 'pages/editscrap/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;
    }
}
