import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Dragula} from 'aurelia-dragula';
import {Cookies} from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

let httpClient = new HttpClient();

@inject(EventAggregator)
export class NewChapter {
    constructor(eventag) {
      this.hidden = true;
      this.ea = eventag;
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
      var scraps_change = this.chapter.scraps.map(function(e) { return [e[0], e[1], e[2]]});
      var body = {scraps: scraps_change, name: this.chapter.name};
      httpClient.fetch('http://remix.ist/chapters/' + this.chapter.author + '/' + this.chapter.uuid, {
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
      httpClient.fetch('http://remix.ist:8000/chapters/new', {
        method: 'post',
        body: JSON.stringify({name: "New Chapter", author: Cookies.get('username')}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
        }
      })
      .then(response => response.json())
      .then(data => {
          this.chapter = data;
      });

      this.new_subscription = this.ea.subscribe('new-scrap', scrap => {
        if (this.hidden) {
          document.getElementById('save-warning').click();
          this.hidden = false;
        }
        this.chapter.scraps.push([scrap.author, scrap.uuid, null, scrap.text]);
        this.router.navigateToRoute('PDFViewer', {type: 'scraps', author: scrap.author, uuid: scrap.uuid});
      });
      this.edit_subscription = this.ea.subscribe('edit-scrap', data => {
        this.chapter.scraps.splice(parseInt(data.index), 1, [data.author, data.uuid, null, data.text]);
        this.router.navigateToRoute('PDFViewer', {type: 'scraps', author: data.author, uuid: data.uuid});
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
          { route: ['newscrap', 'new/:author/:uuid'], name: 'newscrap', moduleId: 'pages/editscrap/newscrap', nav: false, title: 'New Scrap' },
          { route: ['editscrap', 'edit/:author/:uuid'], name: 'editscrap', moduleId: 'pages/editscrap/editscrap', nav: false, title: 'Edit Scrap' },
          { route: 'search', name: 'search', moduleId: 'pages/editchapter/search', nav: true, title: 'Search' },
        ]);
        this.router = router;
    }
}
