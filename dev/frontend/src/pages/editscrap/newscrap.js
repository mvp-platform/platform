import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class Scraps {

    constructor(author) {
        console.log("constructor");

    }

    userText = '';
    enableLatex = false;

    submitNewScrap() {
        console.log(Cookies.get('data'));
        var requested = this.userText;
        var enableLatex = this.enableLatex;
        var theAuthor = Cookies.get('username');
        var theChapter = this.chapters[1];
        var authToken = "Token " + Cookies.get('token');

        console.log(requested);
        console.log(theAuthor);
        console.log(theChapter);
        console.log(enableLatex);


        if(theChapter == undefined || theChapter == null || theChapter == "")
        {
            let request = {
              author: theAuthor,
              text: requested,
              latex: enableLatex
            };

            //CREATE THE NEW SCRAP AND GET THE NEW SCRAP ID
            var scrapID = '';
            httpClient.fetch('http://remix.ist/scraps/new', {
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
                    var scrapID = data.uuid;

                    console.log(scrapID);
           });

        }
        else //The Chapter Was Provided, so create the scrap and then add it to a chapter.
        {
          let request = {
              author: theAuthor,
              text: requested,
              latex: enableLatex
          };


          //CREATE THE NEW SCRAP AND GET THE NEW SCRAP ID
          var scrapID = '';
          httpClient.fetch('http://remix.ist/scraps/new', {
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
                  var scrapID = data.uuid;

                  console.log(scrapID);


                  //var scrapID = "06776465-ab55-45b1-9a8e-5a379bb903b2";

                  this.scraps = [];
                  var test = [];
                  //GET CHAPTERS SCRAPS
                  httpClient.fetch('http://remix.ist:8000/chapters/' + theAuthor + '/' + theChapter)
                      .then(response => response.json())
                      .then(data => {

                              var scraps;
                              console.log(data.scraps);
                              this.scraps.push(data);
                              scraps = data.scraps;

                              //alert(scraps.length);
                              var newScrapRequest = [];

                              //newScrapRequest.push(theAuthor);
                              for(var i = 0; i < scraps.length; i++)
                              {
                                  //alert(scraps[i][1]);
                                  newScrapRequest.push([scraps[i][0], scraps[i][1], scraps[i][2]]);
                                  //newScrapRequest.push(scraps[i][1]);
                                  //newScrapRequest.push(scraps[i][2]);
                              }
                              //alert(oldScraps);
                              newScrapRequest.push([theAuthor, scrapID, null]);
                              //newScrapRequest.push(scrapID);
                              //newScrapRequest.push(null);
                              //alert(newScrapRequest.toString());

                              let request2 = {
                                  scraps:
                                      newScrapRequest

                              };

                              //alert(JSON.stringify(request2));

                              //console.log(this.scraps);
                              //alert(this.scraps);

                              //   UPDATE CHAPTER WITH NEW SCRAPS
                              httpClient.fetch('http://remix.ist/chapters/' + theAuthor + '/' + theChapter, {
                                      method: 'post',
                                      body: JSON.stringify(request2),
                                      headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': authToken
                                      }
                                  })
                                  .then(response => response.json())
                                  .then(data => {
                                      console.log(data)
                                      alert("Scrap has been added to chapter " + theChapter);
                                  });


                      });

              });


        }


    }


    activate(chapterID) {
      var author = '';
      var chapter = '';

      console.log(chapterID);

      author = chapterID.author;
      chapter = chapterID.uuid;

      console.log(author);
      console.log(chapter);
      this.chapters = [];

      this.chapters.push(author);
      this.chapters.push(chapter);

      console.log(this.chapters);
    }

    configureRouter(config, router) {
        config.map([
            { route: ['', ':author/:uuid'], name: 'PDFViewer', moduleId: 'pages/editscrap/PDFViewer', nav: false, title: 'PDF Viewer' },
            { route: ['', 'search'], name: 'Search', moduleId: 'pages/editscrap/search', nav: true, title: 'Search' }
            //{ route: 'emails', name: 'emails', moduleId: 'pages/editscrap/emails', nav: true, title: 'Emails' },
            //{ route: 'notifications', name: 'notifications', moduleId: 'pages/editscrap/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;
    }


}
