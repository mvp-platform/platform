import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class Books {
    constructor() {}
    configureRouter(config, router) {
        config.title = 'Right Tabs';
        config.map([
            { route: ['', 'PDF Viewer'], name: 'PDFViewer', moduleId: 'pages/mybooks/PDFViewer', nav: true, title: 'PDF Viewer'},
            { route: 'account', name: 'account', moduleId: 'pages/mybooks/account', nav: true, title: 'Account' },
            { route: 'emails', name: 'emails', moduleId: 'pages/mybooks/emails', nav: true, title: 'Emails' },
            { route: 'notifications', name: 'notifications', moduleId: 'pages/mybooks/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;

        httpClient.fetch('http://remix.ist:8000/users/hagrid/books')
        .then(response => response.json())
        .then(data => {
            // data = JSON.parse(data);
            console.log(data);
        });
    }
    
}
