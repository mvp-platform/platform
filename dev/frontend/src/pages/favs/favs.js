import { bindable, inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class MainFavs {
    hits = [];
    baseURI = "https://remix.ist/favorites";

    constructor() {
      this.title = "Favorites";
    }

    favorite(thing) {
      var authToken = "Token " + Cookies.get('token');
      let method;
      if (!thing.favorite) {
        method = 'post';
        thing.favorite = true;
      } else {
        method = 'delete';
        thing.favorite = false;
      }
      // add to favs or remove from favs
      httpClient.fetch('https://remix.ist/' + thing.type + 's/' + thing.author + '/' + thing.uuid + '/favorite', {
        method: method,
        headers: {
          'Authorization': authToken
        }
      });
    }

    activate(params, config, navigationInstruction)  {
      const authToken = "Token " + Cookies.get('token');

      httpClient.fetch(this.baseURI, {
        headers: {
          'Authorization': authToken
      }})
      .then(response => response.json())
      .then(data => {
          console.log(data);
          for (let hit of data) {
              hit.favorite = true;
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
