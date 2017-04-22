import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class Scraps {
    constructor()
    {

        // this.scraps = [];
        // //
        // // //' + chapterID.author + '/' + chapterID.uuid)
        // // httpClient.fetch('http://remix.ist:8000/scraps/hagrid')
        // // .then(response => response.json())
        // // .then(data => {
        // //     for(let instance of data) {
        // //         console.log(instance);
        // //         this.scraps.push(instance);
        // //     }
        // //
        // //
        // // });
        //
        //
        // httpClient.fetch('http://remix.ist:8000/scraps/hagrid/4071b78c-2328-4a59-a278-86200f93bfde')
        // .then(response => response.json())
        // .then(data => {
        //     console.log(data);
        //     //this.chapters.push(data);
        //
        //     for(let instance of data) {
        //         console.log(instance);
        //         this.scraps.push(instance);
        //     }
        //
        // });

    }
    activate()
    {
      var userText = "This is a test";
      //alert(userText);
      // this.http = this.httpClient();

      //BookID
      //f12d3550-b93e-455f-8d41-fbd480f464bb

      //chapterID
      //439385c0-66e0-46c3-8390-36805da3154c

      //scrapID
      //4071b78c-2328-4a59-a278-86200f93bfde
      // let request = {
      //   //name: "Hagrid's First Chapter",
      //   //author: "hagrid",
      //   //FOR SETTING CHAPTER
      //   // chapters: [
      //   //   [
      //   //   "hagrid",
      //   //   "439385c0-66e0-46c3-8390-36805da3154c"
      //   //   ]
      //   // ]
      //   text: "\\section{Testing}This is a new UPDATED scrap created with posting via the newscrap page!"
      // };
      //
      // httpClient.fetch('http://remix.ist:8000/scraps/hagrid/4071b78c-2328-4a59-a278-86200f93bfde', {
      //   method: 'post',
      //   body: JSON.stringify(request),
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': 'Token abc123'
      //   }
      // })
      // .then(response => response.json())
      // .then(data => {
      //   console.log(data)
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
