import { bindable } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class search {

    query = "";
    hits = [];
    baseURI = "http://remix.ist:8000/search?q=";
    searchedAtLeastOnce = false;

    constructor() {}

    elasticSearch(newQuery) {
        this.searchedAtLeastOnce = true;
        this.query = encodeURI(newQuery);

        if (this.hits.length != 0) {
            this.hits = [];
        }

        httpClient.fetch(this.baseURI + this.query)
            .then(response => response.json())
            .then(data => {
                //console.log(data);
                for (let hit of data.hits) {
                    this.hits.push(hit);
                }
            });
    }
}