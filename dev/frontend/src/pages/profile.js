import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import { MdToastService } from 'aurelia-materialize-bridge';

let httpClient = new HttpClient();

@inject(MdToastService)
export class Profile {
    constructor(toast) {
      this.toast = toast;
    }

    updateUserDisplayName(){
      //Variables for updating
      var username = '';
      var displayname = '';
      var authToken = '';

      username = this.userName; //Could retrieve from the cookie, but this is already done to load the page
      displayname = this.userDisplayName;
      authToken = "Token " + Cookies.get('token');

      if(displayname !== null || displayname !== "" || displayname !== undefined) {
        var request = {
            name: displayname
        };

        httpClient.fetch('http://remix.ist/accounts/myaccount', {
                    method: 'post',
                    body: JSON.stringify(request),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authToken
                    }
        })
        .then(response => response.json())
        .then(data => {
                console.log(data);
                this.toast.show('Display name updated successfully!', 5000, 'rounded orange');

        });
      }

    }


    activate() {
      var username = '';
      var authToken = '';
      //this.userText = '';

      username = Cookies.get('username');
      authToken = "Token " + Cookies.get('token');

      this.userInfo = [];
      this.userInfo.push(username);

      console.log(this.userInfo);

      httpClient.fetch('http://remix.ist/accounts/myaccount', {
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': authToken
                  }
      })
      .then(response => response.json())
      .then(data => {
              console.log(data);
              this.userName = data.userid;
              this.userDisplayName = data.name;

      });

    }
}
