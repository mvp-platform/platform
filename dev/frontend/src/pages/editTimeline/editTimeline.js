import { bindable, inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { Cookies } from 'aurelia-plugins-cookies';
import {EventAggregator} from 'aurelia-event-aggregator';

let httpClient = new HttpClient();

@inject(EventAggregator)
export class editTimeline {
    pastEvents = [];
    baseURI = "https://remix.ist/";

    constructor(ea) {
      this.ea = ea;
      this.title = "Edit Timeline";
    }

    pin(sha, index) {
      //this.ea.publish('edit-scrap', {text: requested, author: this.scrap[0], uuid: this.scrap[1], index: this.index});
      this.params.current = sha;
      if (this.params.type === "chapters") {
        this.ea.publish('pin-chapter', {sha: sha, author: this.params.author, uuid: this.params.uuid, index: this.params.index});
      } else {
      this.ea.publish('pin-scrap', {sha: sha, author: this.params.author, uuid: this.params.uuid, index: this.params.index});
      }
    }

    activate(params, config, navigationInstruction) {

        this.config = config;
        this.params = params;
        console.log(params);
        console.log(params.current);

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
