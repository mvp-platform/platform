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

      const authToken = "Token " + Cookies.get('token');

      if (this.type) {
        this.uri = this.baseURI + "?type=" + this.type;
      } else {
        this.uri = this.baseURI;
      }

      httpClient.fetch(this.uri, {
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
}
