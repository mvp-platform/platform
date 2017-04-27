import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import { MdToastService } from 'aurelia-materialize-bridge';
import {EventAggregator} from 'aurelia-event-aggregator';

let httpClient = new HttpClient();


@inject(EventAggregator, MdToastService)
export class Scraps {
    constructor(ea, toast) {
      this.ea = ea;
      this.toast = toast;
      this.disabledValue = !this.disabledValue;
    }

    userText = '';
    enableLatex = false;
    disabledValue = false;
    editTags = false;
    editTagsText = '';

    toggleDisabled() {
      this.disabledValue = !this.disabledValue;
      this.editTags = !this.editTags;
    }

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

        var editTags = this.editTags;
        var editedTags = this.editTagsText;


        if(editTags) {
          editedTags = editedTags.toString();
          editedTags = editedTags.replace(/(^,)|(,$)/g, "");
          editedTags = editedTags.replace(/\s/g, '');
          editedTags = editedTags.split(",");

          var request = {
              text: requested,
              latex: enableLatex,
              tags: editedTags
          };
        }
        else {
          var request = {
              text: requested,
              latex: enableLatex
          };
        }

          //UPDATE THE EDITED SCRAP AND GET THE NEW SCRAP ID
          httpClient.fetch('https://remix.ist/scraps/' + theAuthor + '/' + theScrap, {
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
                  this.toast.show('Scrap saved successfully!', 5000);
                  this.ea.publish('edit-scrap', {text: requested, author: this.scrap[0], uuid: this.scrap[1], index: this.index});
              });
    }

    activate(scrapID, route) {
      var author = '';
      var id = '';
      this.userText = '';
      this.enableLatex = false;


      author = Cookies.get('username');
      id = scrapID.uuid;

      this.scrap = [];
      this.scrap.push(author);
      this.scrap.push(id);
      this.index = scrapID.index;

      httpClient.fetch('https://remix.ist/scraps/' + author + '/' + id )
      .then(response => response.json())
      .then(data => {
              console.log(data);
              this.enableLatex = data.latex;
              this.userText = data.text;
              this.editTagsText = data.tags;

      });

    }
    configureRouter(config, router) {
        config.map([
            { route: ['', ':author/:uuid'], name: 'PDFViewer', moduleId: 'pages/editscrap/PDFViewer', nav: true, title: 'PDF Viewer' },
            // { route: 'account', name: 'account', moduleId: 'pages/editscrap/account', nav: true, title: 'Account' },
            // { route: 'emails', name: 'emails', moduleId: 'pages/editscrap/emails', nav: true, title: 'Emails' },
            // { route: 'notifications', name: 'notifications', moduleId: 'pages/editscrap/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;
    }
}
