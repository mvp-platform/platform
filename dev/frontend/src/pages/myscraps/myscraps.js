import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import { bindable } from 'aurelia-framework';

let httpClient = new HttpClient();

@inject(EventAggregator)
export class Scraps {
    @bindable unassociated;
    constructor(eventag) {
      this.ea = eventag;
      this.title = "My Scraps";
      this.scraps = [];
      this.unassociatedScraps = false;
      let username = Cookies.get('username');
      const authToken = "Token " + Cookies.get('token');

      httpClient.fetch('https://remix.ist/scraps/' + username, {
        headers: {
          'Authorization': authToken
        }})
      .then(response => response.json())
      .then(data => {
          for (let instance of data) {
              this.scraps.push(instance);
          }
      });
    }

    favorite(scrap) {
      var authToken = "Token " + Cookies.get('token');
      let method;
      if (!scrap.favorite) {
        method = 'post';
        scrap.favorite = true;
      } else {
        method = 'delete';
        scrap.favorite = false;
      }
      // add to favs or remove from favs
      httpClient.fetch('https://remix.ist/scraps/' + scrap.author + '/' + scrap.uuid + '/favorite', {
        method: method,
        headers: {
          'Authorization': authToken
        }
      });
    }

    unassociatedChanged(newValue) {
      // true = right = unassociated
      if (newValue === true) {
        this.title = "Unassociated Scraps";
        if (!this.unassociatedScraps) {
          return this.get_unassociated();
        }
        this.scraps = this.unassociatedScraps;
      } else {
        this.title = "My Scraps";
        this.scraps = this.allScraps;
      }
    }

    get_unassociated() {
      this.allScraps = this.scraps;

      var authToken = "Token " + Cookies.get('token');
      this.scraps = [];
      httpClient.fetch('https://remix.ist/scraps/unassociated', {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
      }})
      .then(response => response.json())
      .then(data => {
          for (let instance of data) {
              console.log(instance);
              this.scraps.push(instance);
          }
          this.unassociatedScraps = this.scraps;
        });
    }

    attached() {
      this.new_subscription = this.ea.subscribe('new-scrap', scrap => {
         this.scraps.unshift(scrap); // why? who chose this name?
         this.router.navigateToRoute('PDFViewer', {type: 'scraps', author: scrap.author, uuid: scrap.uuid});
     });
     this.edit_subscription = this.ea.subscribe('edit-scrap', data => {
     this.scraps.splice(parseInt(data.index), 1, {text: data.text, author: data.author, uuid: data.uuid});
     console.log(this.scraps);
     this.router.navigateToRoute('PDFViewer', {type: 'scraps', author: data.author, uuid: data.uuid});
    });
    }

    detached() {
      this.new_subscription.dispose();
      this.edit_subscription.dispose();
    }

    unassociated() {
      var authToken = "Token " + Cookies.get('token');
      this.title = "Unassociated Scraps";
      this.scraps = [];
      httpClient.fetch('https://remix.ist/scraps/unassociated', {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
      }})
      .then(response => response.json())
      .then(data => {
          for (let instance of data) {
              this.scraps.push(instance);
          }
      });
    }

    configureRouter(config, router) {
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: ['newscrap'], name: 'newscrap', moduleId: 'pages/editscrap/newscrap', nav: true, title: 'New Scrap' },
            { route: ['editscrap', ':author/:uuid'], name: 'editscrap', moduleId: 'pages/editscrap/editscrap', nav: false, title: 'Edit Scrap' },
            { route: 'search', name: 'search', settings: {type: 'scrap', myStuff: true}, moduleId: 'pages/search/search', nav: true, title: 'Search' },
        ]);
        this.router = router;
    }
}
