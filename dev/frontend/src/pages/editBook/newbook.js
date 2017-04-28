import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Dragula} from 'aurelia-dragula';
import {Cookies} from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

let httpClient = new HttpClient();

@inject(EventAggregator)
export class NewBook {
    constructor(eventag) {
      this.title="New Book";
      this.hidden = true;
      this.ea = eventag;
      this.author = Cookies.get('username');
      this.book = {name: "Enter Book Title Here", author: this.author, uuid: "none"};
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
      this.book.chapters.splice(parseInt(index), 1);
    }


    itemDropped(item, target, source, sibling, itemVM, siblingVM) {
      if(source.dataset.search) {
        this.book.book.splice(parseInt(target.dataset.index), 0, [source.dataset.author, source.dataset.uuid, null, source.dataset.text]);
      } else {
        var move = function(array, from, to) {
          array.splice(to, 0, array.splice(from, 1)[0]);
        };
        move(this.book.chapters, parseInt(source.dataset.index), parseInt(target.dataset.index));
      }
      if (this.hidden) {
        document.getElementById('save-warning').click();
        this.hidden = false;
      }
    }

    saveRearrangements() {

      console.log("save rearrangements");

      //var chapters_change = this.book.chapters.map(function(e) { return [e[0], e[1], e[2]]});
      //var body = {chapters: chapters_change, name: this.book.name};
      var body = {name: this.book.name};

      httpClient.fetch('https://remix.ist/books/' + this.book.author + '/' + this.book.uuid, {
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
       });
    }

    activate(author) {
      httpClient.fetch('https://remix.ist/books/new', {
        method: 'post',
        body: JSON.stringify({name: "Enter Book Title Here", author: Cookies.get('username')}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
        }
      })
      .then(response => response.json())
      .then(data => {
          console.log(data);
          this.book = data;
      });

      // httpClient.fetch('https://remix.ist/books/' + this.author + '/' + '2566ef69-65a1-447d-ba00-f3f8305dbd18')
      // .then(response => response.json())
      // .then(data => {
      //     // for (let instance of data) {
      //         this.books = data;
      //     // }
      // });

      this.new_subscription = this.ea.subscribe('new-chapter', chapter => {
        if (this.hidden) {
          document.getElementById('save-warning').click();
          this.hidden = false;
        }
        this.book.chapters.push([chapter.author, chapter.uuid, null, chapter.text]);
        this.router.navigateToRoute('PDFViewer', {type: 'chapters', author: chapter.author, uuid: chapter.uuid});
      });
      this.edit_subscription = this.ea.subscribe('edit-chapter', data => {
        this.book.chapters.splice(parseInt(data.index), 1, [data.author, data.uuid, null, data.text]);
        this.router.navigateToRoute('PDFViewer', {type: 'chapters', author: data.author, uuid: data.uuid});
      });

    }

    detached() {
      this.new_subscription.dispose();
      this.edit_subscription.dispose();
    }

    configureRouter(config, router) {
        config.title = 'Chapter Tabs';
        config.map([
          { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
          { route: ['newchapter', 'new/:author/:uuid'], name: 'newscrap', moduleId: 'pages/newchapter/newchapter', nav: false, title: 'New Scrap' },
          { route: ['editchapter', 'edit/:author/:uuid'], name: 'editscrap', moduleId: 'pages/editchapter/editchapter', nav: false, title: 'Edit Scrap' },
          { route: 'search', name: 'search', settings: {type: 'scrap'}, moduleId: 'pages/search/search', nav: true, title: 'Search' },
        ]);
        this.router = router;
    }
}
