import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class EditChapters
{
    constructor(chapterID)
    {


        this.chapters = [];


        // httpClient.fetch('http://remix.ist:8000/chapters/' + chapterID.author + '/' + chapterID.uuid)
        // .then(response => response.json())
        // .then(data => {
        //     for(let instance of data) {
        //         console.log(instance);
        //         this.books.push(instance);
        //     }
        //
        // });


        httpClient.fetch('http://remix.ist:8000/chapters/hagrid/68c47c74-f6fb-4e5b-a68c-f2c6b4265bd1')
        .then(response => response.json())
        .then(data => {
            this.chapters.push(data);

            // for(let instance of data) {
            //     console.log(instance);
            //     this.books.push(instance);
            // }

        });

    }
    configureRouter(config, router)
    {
        config.title = 'Chapter Tabs';
        config.map([
            { route: ['', ':author/:uuid'], name: 'PDFViewer', moduleId: 'pages/editchapter/PDFViewer', nav: true, title: 'PDF Viewer' },
            { route: 'account', name: 'account', moduleId: 'pages/editchapter/account', nav: true, title: 'Account' },
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
