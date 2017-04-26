import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Dragula} from 'aurelia-dragula';
import {Cookies} from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class EditChapters {
    constructor() {
      this.hidden = true;
    }


    itemDropped(item, target, source, sibling, itemVM, siblingVM) {
      console.log({item: item, target: target, source: source, sibling: sibling, itemVM: itemVM, siblingVM: siblingVM});
      // console.log(item)
      var move = function(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
      };
      move(this.chapter.scraps, parseInt(source.dataset.index), parseInt(target.dataset.index));

      if (this.hidden) {
        document.getElementById('save-warning').click();
        this.hidden = false;
      }
    }

    saveRearrangements() {
      var theAuthor = Cookies.get('username');
      var authToken = "Token " + Cookies.get('token');

      // have to get rid of the text field to save scraps
      var scraps_change = this.chapter.scraps.map(function(e) { return [e[0], e[1], e[2]]});
      httpClient.fetch('http://remix.ist/chapters/' + this.chapter.author + '/' + this.chapter.uuid, {
        method: 'post',
        body: JSON.stringify({scraps: scraps_change}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
        }
      })
      .then(response => response.json())
      .then(data => {
          console.log(data);
         document.getElementById('save-warning').click();
       });
    }

    activate(author) {

        this.chapter = null;

        httpClient.fetch('http://remix.ist:8000/chapters/' + author.author + '/' + author.uuid)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.chapter = data;
            });

    }

    configureRouter(config, router) {
        config.title = 'Chapter Tabs';
        config.map([
          { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
          { route: ['newscrap', 'new/:author/:uuid'], name: 'newscrap', moduleId: 'pages/editscrap/newscrap', nav: false, title: 'New Scrap' },
          { route: ['editscrap', 'edit/:author/:uuid'], name: 'editscrap', moduleId: 'pages/editscrap/editscrap', nav: false, title: 'Edit Scrap' },
          { route: 'search', name: 'search', moduleId: 'pages/editchapter/search', nav: true, title: 'search' },
        ]);
        this.router = router;
    }
}
