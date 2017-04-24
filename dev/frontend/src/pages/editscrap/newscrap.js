import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class Scraps {

    constructor(author) {
        console.log("constructor");
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


    // email = '';
    // password = '';
    userText = '';

    submitNewScrap() {
        var requested = this.userText;
        var theAuthor = this.chapters[0];
        var theChapter = this.chapters[1];
        var authToken = 'Token abc123';

        console.log(requested);
        console.log(theAuthor);
        console.log(theChapter);


        //alert(userText);
        // this.http = this.httpClient();
        //BookID
        //f12d3550-b93e-455f-8d41-fbd480f464bb
        //chapterID
        //439385c0-66e0-46c3-8390-36805da3154c
        //scrapID
        //4071b78c-2328-4a59-a278-86200f93bfde
        if(theChapter == undefined || theChapter == null || theChapter == "")
        {
            let request = {
                //   //name: "Hagrid's First Chapter",
                author: theAuthor,
                //   //FOR SETTING CHAPTER
                //   // chapters: [
                //   //   [
                //   //   "hagrid",
                //   //   "439385c0-66e0-46c3-8390-36805da3154c"
                //   //   ]
                //   // ]
                //   text: "\\section{Testing}This is a new UPDATED scrap created with posting via the newscrap page!"
                text: requested
            };

            //CREATE THE NEW SCRAP AND GET THE NEW SCRAP ID
            //var scrapID = '';
            // httpClient.fetch('http://remix.ist:8000/scraps/new', {
            //         method: 'post',
            //         body: JSON.stringify(request),
            //         headers: {
            //             'Content-Type': 'application/json',
            //             'Authorization': 'Token abc123'
            //         }
            //     })
            //     .then(response => response.json())
            //     .then(data => {
            //         console.log("theChapter wasn't provided");
            //         console.log(data);
            //
            //         //alert("Scrap with " + data.uuid + "created successfully!");
            //     });


        }
        else //The Chapter Was Provided, so create the scrap and then add it to a chapter.
        {
          let request = {
              //   //name: "Hagrid's First Chapter",
              author: theAuthor,
              //   //FOR SETTING CHAPTER
              //   // chapters: [
              //   //   [
              //   //   "hagrid",
              //   //   "439385c0-66e0-46c3-8390-36805da3154c"
              //   //   ]
              //   // ]
              //   text: "\\section{Testing}This is a new UPDATED scrap created with posting via the newscrap page!"
              text: requested
          };


          // CREATE THE NEW SCRAP AND GET THE NEW SCRAP ID
          var scrapID = '';
          httpClient.fetch('http://remix.ist:8000/scraps/new', {
                  method: 'post',
                  body: JSON.stringify(request),
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': authToken
                  }
              })
              .then(response => response.json())
              .then(data => {
                  console.log("response: ");
                  scrapID = data.uuid;
                  console.log(scrapID);

                  //RECOVER CHAPTERS SCRAPS
                  // let request3 = {
                  //     //   //name: "Hagrid's First Chapter",
                  //     //author: theAuthor,
                  //     //   //FOR SETTING CHAPTER
                  //     chapters:
                  //     [
                  //         [
                  //         theAuthor,
                  //         theChapter
                  //         ]
                  //     ]
                  //     //   text: "\\section{Testing}This is a new UPDATED scrap created with posting via the newscrap page!"
                  //     text: requested
                  // };

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
                                  //   //name: "Hagrid's First Chapter",
                                  scraps:
                                      newScrapRequest

                              };

                              alert(JSON.stringify(request2));

                              //console.log(this.scraps);
                              //alert(this.scraps);

                              // httpClient.fetch('http://remix.ist:8000/chapters/' + theAuthor + '/' + theChapter, {
                              //         method: 'post',
                              //         body: JSON.stringify(request2),
                              //         headers: {
                              //             'Content-Type': 'application/json',
                              //             'Authorization': authToken
                              //         }
                              //     })
                              //     .then(response => response.json())
                              //     .then(data => {
                              //         console.log(data)
                              //         alert("Scrap has been added to chapter " + theChapter);
                              //     });


                      });

              });


        }



        //console.log(this.scraps);
        //alert(this.scraps);

        //
        // httpClient.fetch('http://remix.ist:8000/scraps/new', {
        //         method: 'post',
        //         body: JSON.stringify(request),
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': 'Token abc123'
        //         }
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log(data)
        //     });

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
      // httpClient.fetch('http://remix.ist:8000/chapters/' + author.author + '/' + author.uuid)
      //     .then(response => response.json())
      //     .then(data => {
      //         console.log(data);
      //         this.chapters.push(data);
      //     });



    }

    configureRouter(config, router) {
        config.map([
            { route: ['', ':author/:uuid'], name: 'PDFViewer', moduleId: 'pages/editscrap/PDFViewer', nav: false, title: 'PDF Viewer' },
            { route: ['', 'search'], name: 'search', moduleId: 'pages/editscrap/search', nav: true, title: 'search' },
            { route: 'emails', name: 'emails', moduleId: 'pages/editscrap/emails', nav: true, title: 'Emails' },
            { route: 'notifications', name: 'notifications', moduleId: 'pages/editscrap/notifications', nav: true, title: 'Notifications' }
        ]);
        this.router = router;
    }


}
