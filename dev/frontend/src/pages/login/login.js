import { HttpClient, json } from 'aurelia-fetch-client';

let httpClient = new HttpClient();

let loginhtml ='<div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>';

export class Login {
    attached() {
      console.log('activated');
      gapi.signin2.render('logindiv', {
        scope: 'profile email',
        width: 250,
        height: 50,
        longtitle: true,
        theme: 'dark',
        onsuccess: onSignIn,
        onfailure: handleFailure
      });
    }
    activate() {
      console.log('login initiated');
    }
}
