import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Dragula} from 'aurelia-dragula';
import {Cookies} from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import { MdToastService } from 'aurelia-materialize-bridge';

const httpClient = new HttpClient();

@inject(EventAggregator, MdToastService)
export class EditBook {
  constructor(eventag, toast) {
    this.title = "Edit Book";
    this.hidden = true;
    this.ea = eventag;
    this.toast = toast;
    this.author = Cookies.get('username');
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

      this.book.chapters.splice(parseInt(target.dataset.index), 0, [source.dataset.author, source.dataset.uuid, null]);
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
    console.log(this.book);
    var theAuthor = Cookies.get('username');
    var authToken = "Token " + Cookies.get('token');

    // have to get rid of the text field to save chapters
    var chapters_change = this.book.chapters.map(function(e) { return [e[0], e[1], e[2]]});
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
        this.toast.show('This book has successfully been updated.', 5000, 'rounded orange');
     });
  }



  activate(author) {
    httpClient.fetch(`https://remix.ist/books/${author.author}/${author.uuid}`)
            .then(response => response.json())
            .then((data) => {
              this.book = data;
            });
  }

  configureRouter(config, router) {
    config.title = 'Book Tabs';
    config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: ['newchapter'], name: 'newchapter', moduleId: 'pages/editchapter/newchapter', nav: true, title: 'New Chapter' },
            { route: 'search', name: 'search', moduleId: 'pages/search/search', settings: { type: 'chapter' }, nav: true, title: 'Search' },
    ]);
    this.router = router;
  }
}
