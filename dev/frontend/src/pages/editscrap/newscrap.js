import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import { MdToastService } from 'aurelia-materialize-bridge';
import {EventAggregator} from 'aurelia-event-aggregator';

let httpClient = new HttpClient();

@inject(EventAggregator, MdToastService)
export class NewScrap {
    constructor(eventag, toast) {
      this.ea = eventag;
      this.toast = toast;
      this.disabledValue = !this.disabledValue;
    }

    userText = '';
    enableLatex = false;
    disabledValue = false;
    submitTags = false;
    submitTagsText = [];

    toggleDisabled() {
      this.disabledValue = !this.disabledValue;
      this.submitTags = !this.submitTags;
    }

    submitNewScrap() {
      var requested = this.userText;
      var enableLatex = this.enableLatex;
      var theAuthor = Cookies.get('username');
      var theChapter = this.chapters[1];
      var authToken = "Token " + Cookies.get('token');

      var submitTags = this.submitTags;
      var submittedTags = this.submitTagsText;

      if(theChapter == undefined || theChapter == null || theChapter == "") {
        if(submitTags) {
          submittedTags = submittedTags.toString();
          submittedTags = submittedTags.replace(/(^,)|(,$)/g, "");
          submittedTags = submittedTags.replace(/\s/g, '');
          submittedTags = submittedTags.split(",");
        }
        let request = {
          author: theAuthor,
          text: requested,
          latex: enableLatex,
          tags: submittedTags
        };

        //CREATE THE NEW SCRAP AND GET THE NEW SCRAP ID
        var scrapID = '';
        httpClient.fetch('https://remix.ist/scraps/new', {
          method: 'post',
          body: JSON.stringify(request),
          headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken
          }
        })
        .then(response => response.json())
        .then(data => {
          var scrapID = data.uuid;
          this.toast.show('Scrap saved successfully!', 5000);
          this.ea.publish('new-scrap', data);
       });
      } else { //The Chapter Was Provided, so create the scrap and then add it to a chapter.
        if(submitTags) {
          submittedTags = submittedTags.toString();
          submittedTags = submittedTags.replace(/(^,)|(,$)/g, "");
          submittedTags = submittedTags.replace(/\s/g, '');
          submittedTags = submittedTags.split(",");
        }

        let request = {
          author: theAuthor,
          text: requested,
          latex: enableLatex,
          tags: submittedTags
        };

        //CREATE THE NEW SCRAP AND GET THE NEW SCRAP ID
        var scrapID = '';
        httpClient.fetch('https://remix.ist/scraps/new', {
            method: 'post',
            body: JSON.stringify(request),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken
            }
        })
        .then(response => response.json())
        .then(data => {
          var new_scrap = data;
          var scrapID = data.uuid;

          this.scraps = [];
          var test = [];
          //GET CHAPTERS SCRAPS
          httpClient.fetch('https://remix.ist/chapters/' + theAuthor + '/' + theChapter)
          .then(response => response.json())
          .then(data => {

            var scraps;
            this.scraps.push(data);
            scraps = data.scraps;

            var newScrapRequest = [];

            for(var i = 0; i < scraps.length; i++) {
              newScrapRequest.push([scraps[i][0], scraps[i][1], scraps[i][2]]);
            }
            newScrapRequest.push([theAuthor, scrapID, null]);
            let request2 = {
              scraps:
                newScrapRequest
            };

            //   UPDATE CHAPTER WITH NEW SCRAPS
            httpClient.fetch('https://remix.ist/chapters/' + theAuthor + '/' + theChapter, {
              method: 'post',
              body: JSON.stringify(request2),
              headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
              }
            })
            .then(response => response.json())
            .then(data => {
              this.toast.show('Scrap saved successfully!', 5000);
              this.ea.publish('new-scrap', new_scrap);
            });
          });
        });
      }
    }


    activate(chapterID) {
      var author = '';
      var chapter = '';

      author = chapterID.author;
      chapter = chapterID.uuid;

      this.chapters = [];

      this.chapters.push(author);
      this.chapters.push(chapter);
    }
}
