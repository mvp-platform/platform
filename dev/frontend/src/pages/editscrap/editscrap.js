import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class Scraps {
    constructor() {
    }

    userText = '';
    enableLatex = false;

    submitEditScrap() {
        console.log(Cookies.get('data'));
        var theAuthor = Cookies.get('username');
        var authToken = "Token " + Cookies.get('token');
        var theScrap = this.scrap[1];
        var enableLatex = this.enableLatex;
        var requested = this.userText;


        console.log(requested);
        console.log(theAuthor);
        console.log(theScrap);
        console.log(enableLatex);

          let request = {
              //author: theAuthor,
              text: requested,
              latex: enableLatex
          };


          //UPDATE THE EDITED SCRAP AND GET THE NEW SCRAP ID
          httpClient.fetch('http://remix.ist/scraps/' + theAuthor + '/' + theScrap, {
                  method: 'post',
                  body: JSON.stringify(request),
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': authToken
                  }
              })
              .then(response => response.json())
              .then(data => {
                  console.log(data);

              });

    }

    activate(scrapID) {
      var author = '';
      var id = '';
      this.userText = '';
      this.enableLatex = false;


      author = Cookies.get('username');
      id = scrapID.uuid;

      this.scrap = [];
      this.scrap.push(author);
      this.scrap.push(id);

      console.log(this.scrap);

      httpClient.fetch('http://remix.ist/scraps/' + author + '/' + id )
      .then(response => response.json())
      .then(data => {
              console.log(data);
              this.enableLatex = data.latex;
              this.userText = data.text;
      });

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
