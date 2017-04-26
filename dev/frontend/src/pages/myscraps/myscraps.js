import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class Scraps {
    constructor(scrapID) {
      this.title = "My Scraps";
      this.scraps = [];
      let username = Cookies.get('username');

      httpClient.fetch('http://remix.ist:8000/scraps/' + username)
      .then(response => response.json())
      .then(data => {
          for (let instance of data) {
              this.scraps.push(instance);
          }
      });
    }

    unassociated() {
      var authToken = "Token " + Cookies.get('token');
      this.title = "Unassociated Scraps";
      this.scraps = [];
      httpClient.fetch('http://remix.ist:8000/scraps/unassociated', {
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
            { route: 'search', name: 'search', moduleId: 'pages/myscraps/search', nav: true, title: 'Search' },
        ]);
        this.router = router;
    }
}
