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

    addBold(){
      var requested = this.userText;
      requested += "\\textbf{}";
      this.userText = requested;
    }

    addItalic(){
      var requested = this.userText;
      requested += "\\emph{ }";
      this.userText = requested;
    }

    addUnderline(){
      var requested = this.userText;
      requested += "\\underline{}";
      this.userText = requested;
    }

    // addHRule(){
    //   var requested = this.userText;
    //   requested += "\\hline";
    //   this.userText = requested;
    // }

    addSubSection(){
      var requested = this.userText;
      requested += "\\subsection{}";
      this.userText = requested;
    }

    addSubSubSection(){
      var requested = this.userText;
      requested += "\\subsubsection{}";
      this.userText = requested;
    }

    addParagraph(){
      var requested = this.userText;
      requested += "\\paragraph{}";
      this.userText = requested;
    }

    addSpace(){
      var requested = this.userText;
      requested += "\\vspace{5pt}";
      this.userText = requested;
    }

    addNewPage(){
      var requested = this.userText;
      requested += "\\newpage";
      this.userText = requested;
    }

    addClearPage(){
      var requested = this.userText;
      requested += "\\clearpage";
      this.userText = requested;
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
}
