import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Dragula} from 'aurelia-dragula';
import {Cookies} from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import { MdToastService } from 'aurelia-materialize-bridge';

let httpClient = new HttpClient();

@inject(EventAggregator, MdToastService)
export class NewChapter {
    constructor(eventag, toast) {
      this.hidden = true;
      this.ea = eventag;
      this.toast = toast;
      this.author = Cookies.get('username');
      this.chapter = {name: "New Chapter", author: this.author, uuid: "none"};
      this.token = "Token " + Cookies.get('token');
    }

    updateName = () => {
      this.nameUpdated = true;
      if (this.hidden) {
        document.getElementById('save-warning').click();
        this.hidden = false;
      }
    }

    delete(index) {
      if (this.hidden) {
        document.getElementById('save-warning').click();
        this.hidden = false;
      }
      this.chapter.scraps.splice(parseInt(index), 1);
    }

    pin(i) {
      if (this.hidden) {
        document.getElementById('save-warning').click();
        this.hidden = false;
      }
      // get history
      httpClient.fetch('https://remix.ist/scraps/' + this.chapter.scraps[parseInt(i)].author + '/' + this.chapter.scraps[parseInt(i)].uuid + '/history')
      .then(response => response.json())
      .then(data => {
          this.chapter.scraps[parseInt(i)].sha = data[0][0];
       });
    }

    unpin(i) {
      if (this.hidden) {
        document.getElementById('save-warning').click();
        this.hidden = false;
      }
      this.chapter.scraps[parseInt(i)].sha = null;
    }


    itemDropped(item, target, source, sibling, itemVM, siblingVM) {
      if(source.dataset.search) {
        this.chapter.scraps.splice(parseInt(target.dataset.index), 0, [source.dataset.author, source.dataset.uuid, null, source.dataset.text]);
      } else {
        var move = function(array, from, to) {
          array.splice(to, 0, array.splice(from, 1)[0]);
        };
        move(this.chapter.scraps, parseInt(source.dataset.index), parseInt(target.dataset.index));
      }
      if (this.hidden) {
        document.getElementById('save-warning').click();
        this.hidden = false;
      }
    }

    saveRearrangements() {

      console.log("save rearrangements");
      // if(this.type == "book")
      // {

        var scraps_change = this.chapter.scraps.map(function(e) { return [e[0], e[1], e[2]]});
        var body = {scraps: scraps_change, name: this.chapter.name.trim()};
        httpClient.fetch('https://remix.ist/chapters/' + this.chapter.author + '/' + this.chapter.uuid, {
          method: 'post',
          body: JSON.stringify(body),
          headers: {
              'Content-Type': 'application/json',
              'Authorization': this.token
          }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
           document.getElementById('save-warning').click();
           this.hidden = true;
           this.toast.show('A new chapter has successfully been added.', 5000);
         });
    //  }
    }

    userText = '';


    submitNewChapter() {
      //console.log(author);

      var requested = this.userText;
      var bookAuthor = this.author[0];
      var bookID = this.author[1];
      console.log(requested);


      httpClient.fetch('https://remix.ist/chapters/new', {
        method: 'post',
        body: JSON.stringify({name: requested, author: Cookies.get('username')}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
        }
      })
      .then(response => response.json())
      .then(data => {
          this.chapter = data;

          console.log(data);
          console.log("Finished With Chapter Creation");

          let chapterAuthor = data.author;
          let chapterID = data.uuid;
          let chapterTitle = data.name;

          console.log(bookAuthor);
          console.log(bookID);
          console.log(chapterID);

          console.log('https://remix.ist/books/' + bookAuthor + '/' + bookID);

          if(bookID !== undefined || bookID !== null || bookID !== "")
          {
            this.type = "book";
            //httpClient.fetch(`https://remix.ist/books/${author.author}/${author.uuid}`, {
            httpClient.fetch('https://remix.ist/books/' + bookAuthor + '/' + bookID, {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': this.token
              }
            })
            .then(response => response.json())
            .then(data => {
                //this.booksChapters = data.chapters;

                var booksChapters;
                //this.booksChapters.push(data);
                booksChapters = data.chapters;

                var newChapterRequest = [];

                for(var i = 0; i < booksChapters.length; i++) {
                  newChapterRequest.push([booksChapters[i][0], booksChapters[i][1], booksChapters[i][2]]);
                }
                newChapterRequest.push([chapterAuthor, chapterID, null]);

                let body = {
                  chapters:
                    newChapterRequest
                };

                console.log("Update Book Now!");

                console.log(JSON.stringify(body));
                this.type = "book";
                //httpClient.fetch(`https://remix.ist/books/${author.author}/${author.uuid}`, {
                httpClient.fetch('https://remix.ist/books/' + bookAuthor + '/' + bookID, {
                  method: 'post',
                  body: JSON.stringify(body),
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': this.token
                  }
                })
                .then(response => response.json())
                .then(data => {
                    this.book = data;
                    console.log(data);
                    this.toast.show('Chapter created successfully!', 5000);
                    this.ea.publish('new-chapter', {chapterAuthor, chapterID, null, requested, null});
                });
            });

          }
          else {
            console.log("No Book ID Provided");
            this.toast.show('Chapter created successfully!', 5000);
          }

      });


    }

    activate(bookID) {

      var author = Cookies.get('username');
      var bookID = bookID.uuid;

      console.log(author);
      console.log(bookID);

      this.author = [];

      this.author.push(author);

      if(bookID !== undefined) {
        this.author.push(bookID);
      }

    }
    // configureRouter(config, router) {
    //     config.title = 'Chapter Tabs';
    //     config.map([
    //       { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
    //       { route: ['newscrap', 'new/:author/:uuid'], name: 'newscrap', moduleId: 'pages/editscrap/newscrap', nav: false, title: 'New Scrap' },
    //       { route: ['editscrap', 'edit/:author/:uuid'], name: 'editscrap', moduleId: 'pages/editscrap/editscrap', nav: false, title: 'Edit Scrap' },
    //       { route: 'search', name: 'search', settings: {type: 'scrap'}, moduleId: 'pages/search/search', nav: true, title: 'Search' },
    //     ]);
    //     this.router = router;
    // }
}
