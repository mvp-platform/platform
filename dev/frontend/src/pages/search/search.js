import { bindable, inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class search {
    hits = [];
    baseURI = "https://remix.ist/search?q=";
    searchedAtLeastOnce = false;

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
      // for now, we'll constrain to only the kind of things on the left hand pane
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
}
