import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Dragula} from 'aurelia-dragula';
import {Cookies} from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import { MdToastService } from 'aurelia-materialize-bridge';

let httpClient = new HttpClient();

@inject(EventAggregator, MdToastService)
export class NewBook {
    constructor(eventag, toast) {
      this.title="New Book";
      this.hidden = true;
      this.ea = eventag;
      this.toast = toast;
      this.author = Cookies.get('username');
      this.book = {name: "Enter Book Title Here", author: this.author, uuid: "none", chapters: []};
      this.token = "Token " + Cookies.get('token');
    }

    updateName = () => {
      this.nameUpdated = true;
      if (this.hidden) {
        document.getElementById('save-warning').click();
        this.hidden = false;
      }
    }

    pin(i) {
      if (this.hidden) {
        document.getElementById('save-warning').click();
        this.hidden = false;
      }
      // get history
      httpClient.fetch('https://remix.ist/chapters/' + this.book.chapters[parseInt(i)].author + '/' + this.book.chapters[parseInt(i)].uuid + '/history')
      .then(response => response.json())
      .then(data => {
          this.book.chapters[parseInt(i)].sha = data[0][0];
       });
    }

    unpin(i) {
      if (this.hidden) {
        document.getElementById('save-warning').click();
        this.hidden = false;
      }
      this.book.chapters[parseInt(i)].sha = null;
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
        this.book.chapters.splice(parseInt(target.dataset.index), 0, {author: source.dataset.author, uuid: source.dataset.uuid, favorite: source.dataset.favorite, name: source.dataset.name, sha: null});
      }
      else {
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
      var theAuthor = Cookies.get('username');
      var authToken = "Token " + Cookies.get('token');

      // have to get rid of the text field to save chapters
      var chapters_change = this.book.chapters.map(function(e) { return [e.author, e.uuid, e.sha]});
      var body = {chapters: chapters_change};

      if (this.nameUpdated) {
        body.name = this.book.name.trim();
      }
      httpClient.fetch('https://remix.ist/books/' + this.book.author + '/' + this.book.uuid, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
        }
      })
      .then(response => response.json())
      .then(data => {
          console.log(data);
          document.getElementById('save-warning').click();
          this.hidden = true;
          this.toast.show('This book has successfully been updated.', 5000);
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
          { route: ['mychaptersside'], name: 'mychaptersside', moduleId: 'pages/mychapters/mychaptersside', nav: true, title: 'My Chapters' },
          { route: 'search', name: 'search', settings: {type: 'chapter'}, moduleId: 'pages/search/search', nav: true, title: 'Search' },
          { route: 'favs', name: 'favs', settings: {type: 'chapter'}, moduleId: 'pages/favs/favpanel', nav: true, title: 'Favorites' },
        ]);
        this.router = router;
    }
}
