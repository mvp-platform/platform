import { bindable } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class search {

    query = "";
    hits = [];

    constructor() {}

    elasticSearch(newQuery) {

        console.log(newQuery);
        this.query = newQuery;

        if (this.hits.length != 0) {
            this.hits = [];
        }

        httpClient.fetch('http://remix.ist:8000/search?q=Searchable')
            .then(response => response.json())
            .then(data => {
                //console.log(data);
                for (let hit of data.hits) {
                    this.hits.push(hit);
                }
            });
        console.log(this.hits);
    }
}