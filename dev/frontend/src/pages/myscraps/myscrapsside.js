import 'fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import { Cookies } from 'aurelia-plugins-cookies';
import { bindable } from 'aurelia-framework';

let httpClient = new HttpClient();

export class Scraps {
    constructor() {
        this.title = "My Scraps";
        this.scraps = [];
        this.unassociatedScraps = false;
        let username = Cookies.get('username');
        const authToken = "Token " + Cookies.get('token');

        httpClient.fetch('https://remix.ist/scraps/' + username, {
                headers: {
                    'Authorization': authToken
                }
            })
            .then(response => response.json())
            .then(data => {
                for (let instance of data) {
                    this.scraps.push(instance);
                }
                console.log(this.scraps);
            });
    }

    unassociatedChanged(newValue) {
        // true = right = unassociated
        if (newValue === true) {
            this.title = "Unassociated Scraps";
            if (!this.unassociatedScraps) {
                return this.get_unassociated();
            }
            this.scraps = this.unassociatedScraps;
        } else {
            this.title = "My Scraps";
            this.scraps = this.allScraps;
        }
    }

    get_unassociated() {
        this.allScraps = this.scraps;

        var authToken = "Token " + Cookies.get('token');
        this.scraps = [];
        httpClient.fetch('https://remix.ist/scraps/unassociated', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                }
            })
            .then(response => response.json())
            .then(data => {
                for (let instance of data) {
                    console.log(instance);
                    this.scraps.push(instance);
                }
                this.unassociatedScraps = this.scraps;
            });
    }

    unassociated() {
        var authToken = "Token " + Cookies.get('token');
        this.title = "Unassociated Scraps";
        this.scraps = [];
        httpClient.fetch('https://remix.ist/scraps/unassociated', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                }
            })
            .then(response => response.json())
            .then(data => {
                for (let instance of data) {
                    this.scraps.push(instance);
                }
            });
    }
}