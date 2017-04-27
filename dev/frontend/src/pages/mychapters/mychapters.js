import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';
import { bindable } from 'aurelia-framework';

let httpClient = new HttpClient();

export class Chapters {
    @bindable unassociated;
    constructor() {
      this.title = "My Chapters";
      this.chapters = [];
      this.unassociatedChapters = false;
      let username = Cookies.get('username');

      httpClient.fetch('https://remix.ist/chapters/' + username)
      .then(response => response.json())
      .then(data => {
          for (let instance of data) {
              console.log(instance);
              this.chapters.push(instance);
          }
        });
    }

    unassociatedChanged(newValue) {
      // true = right = unassociated
      if (newValue === true) {
        this.title = "Unassociated Chapters";
        if (!this.unassociatedChapters) {
          return this.get_unassociated();
        }
        this.chapters = this.unassociatedChapters;
      } else {
        this.title = "My Chapters";
        this.chapters = this.allChapters;
      }
    }

    get_unassociated() {
      this.allChapters = this.chapters;

      var authToken = "Token " + Cookies.get('token');

      this.title = "Unassociated Chapters";
      this.chapters = [];
      httpClient.fetch('https://remix.ist/chapters/unassociated', {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
      }})
      .then(response => response.json())
      .then(data => {
          for (let instance of data) {
              console.log(instance);
              this.chapters.push(instance);
          }
          this.unassociatedChapters = this.chapters;
        });
    }

    activate(chapter) {
      console.log(chapter);
    }

    configureRouter(config, router) {
        config.title = 'Chapter Tabs';
        config.map([
            { route: ['', ':type/:author/:uuid'], name: 'PDFViewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
            { route: 'search', name: 'search', settings: {type: 'chapter'}, moduleId: 'pages/search/search', nav: true, title: 'Search' },
        ]);
        this.router = router;
    }
}
