import { bindable, inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class MainSearch {
    hits = [];
    baseURI = "https://remix.ist/search?q=";
    searchedAtLeastOnce = false;

    constructor() {
      this.title = "Search";
      this.user = Cookies.get('username');
    }

    fork(thing) {
      // fork
      var authToken = "Token " + Cookies.get('token');
      httpClient.fetch('https://remix.ist/' + thing._type + 's/' + thing._source.author + '/' + thing._source.uuid + '/fork', {
        method: 'post',
        headers: {
          'Authorization': authToken
        }
      })
      .then(response => response.json())
      .then(data => {
          thing._source.author = data.author;
       });
    }

    activate(params, config, navigationInstruction)  {
      this.config = config;
      console.log(config);
      if(config) {
        this.searchOwn = config.settings.myStuff;
        this.type = config.settings.type;
        this.mainSearch = config.settings.mainSearch ? true : false;
      } else {
        this.mainSearch = true;
        this.searchOwn = false;
      }
    }

    elasticSearch(newQuery, searchOwn, searchBooks, searchChapters, searchScraps) {
      let queryParams = "";

      if (searchOwn === true) {
          queryParams += "&user=" + Cookies.get('username');
      }
      if (this.type) {
          queryParams += "&type=" + this.type;
      }

      this.searchedAtLeastOnce = true;
      this.query = encodeURI(newQuery);

      if (this.hits.length !== 0) {
        this.hits = [];
      }

      httpClient.fetch(this.baseURI + this.query + queryParams)
      .then(response => response.json())
      .then(data => {
          for (let hit of data.hits) {
              this.hits.push(hit);
          }
      });
    }

    configureRouter(config, router) {
        config.map([
          { route: ['', ':type/:author/:uuid'], name: 'pdfviewer', moduleId: 'pages/pdfviewer/pdfviewer', nav: true, title: 'PDF Viewer' },
        ]);
        this.router = router;
    }
}
