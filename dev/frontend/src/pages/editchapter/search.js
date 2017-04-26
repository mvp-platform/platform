import { bindable } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class search {
    hits = [];
    baseURI = "http://remix.ist/search?q=";
    searchedAtLeastOnce = false;

    constructor() {}

    elasticSearch(newQuery, searchOwn, searchBooks, searchChapters, searchScraps) {
      // for now, we'll constrain to only the kind of things on the left hand pane
      let queryParams = "";

      if (searchOwn === true) {
          queryParams += "&user=" + Cookies.get('username');
      }
      // if (searchBooks === true) {
      //       SB = "&type=book";
      //   }
      //   if (searchChapters === true) {
      //       SC = "&type=chapter";
      //   }
        // if (searchScraps === true) {
      queryParams += "&type=scrap";
        // }

      this.searchedAtLeastOnce = true;
      this.query = encodeURI(newQuery);

      if (this.hits.length !== 0) {
        this.hits = [];
      }

      httpClient.fetch(this.baseURI + this.query + queryParams)
      .then(response => response.json())
      .then(data => {
          //console.log(data);
          for (let hit of data.hits) {
              this.hits.push(hit);
          }
      });
    }
}
