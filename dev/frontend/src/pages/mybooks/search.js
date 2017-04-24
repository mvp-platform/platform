import { bindable } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

export class search {

    query = "";
    hits = [];
    baseURI = "http://remix.ist:8000/search?q=";
    searchedAtLeastOnce = false;

    constructor() {}

    elasticSearch(newQuery, searchOwn, searchBooks, searchChapters, searchScraps) {

        let SO = '';
        let SB = '';
        let SC = '';
        let SS = '';

        if (searchOwn === true) {
            SO = "&user=hagrid"
        }
        if (searchBooks === true) {
            SB = "&type=book"
        }
        if (searchChapters === true) {
            SC = "&type=chapter"
        }
        if (searchScraps === true) {
            SS = "&type=scrap"
        }

        //console.log(newQuery + " " + searchOwn + " " + searchBooks + " " + searchChapters + " " + searchScraps);

        this.searchedAtLeastOnce = true;
        this.query = encodeURI(newQuery);

        if (this.hits.length !== 0) {
            this.hits = [];
        }
        //console.log(this.baseURI + this.query + SO + SB + SC + SS);
        httpClient.fetch(this.baseURI + this.query + SO + SB + SC + SS)
            .then(response => response.json())
            .then(data => {
                //console.log(data);
                for (let hit of data.hits) {
                    this.hits.push(hit);
                }
            });
    }
}