import { bindable, inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { Cookies } from 'aurelia-plugins-cookies';

let httpClient = new HttpClient();

export class editTimeline {
    pastEvents = [];
    baseURI = "https://remix.ist/";

    constructor() {
        this.title = "Edit Timeline";
    }

    activate(params, config, navigationInstruction) {

        this.config = config;

        if (this.pastEvents.length !== 0) {
            this.pastEvents = [];
        }

        const authToken = "Token " + Cookies.get('token');

        this.uri = this.baseURI + params.type + "/" + params.author + "/" + params.uuid + "/history";

        httpClient.fetch(this.uri, {
                headers: {
                    'Authorization': authToken
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                for (let pastEvent of data) {
                    pastEvent.editTimeline = true;
                    this.pastEvents.push(pastEvent);
                }
            });

    }
}