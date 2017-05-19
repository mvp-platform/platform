import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Cookies} from 'aurelia-plugins-cookies';
import { inject } from 'aurelia-framework';
import { MdToastService } from 'aurelia-materialize-bridge';

let httpClient = new HttpClient();

const loginhtml = '<div class="g-signin2" data-onsuccess="signOut()" data-theme="dark"></div>';

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

        httpClient.fetch('https://remix.ist/accounts/myaccount', {
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

    // let loggedInRoutes = [
    //     { route: '', redirect: 'mybooks' },
    // ];
    //
    // const loggedOutRoutes = loggedInRoutes.map(r => ({ route: r.route, redirect: 'login' }));
    // loggedOutRoutes.push({ route: 'login', name: 'login', moduleId: './pages/login/login', nav: false, title: 'Login' });



    logout() {
      Cookies.removeAll();
      gapi.load('auth2', function() {
        gapi.auth2.init().then(function() {
          gapi.auth2.getAuthInstance().signOut().then(function() {
            window.location.reload(true);
          });
        });
      });

      //this.router.navigateToRoute('search');


    }

    // configureRouter(config, router) {
    //   //config.map[{ route: 'login', name: 'login', moduleId: './pages/login/login', nav: false, title: 'Login' }];
    //
    //   if (Cookies.get('username') === null) {
    //     config.title = 'MVP';
    //     config.map(loggedOutRoutes);
    //     this.router = router;
    //     return;
    //   }
    // }

    // configureRouter(config, router) {
    //     config.map([
    //         { route: '',  name: 'mybooks',  moduleId: './mybooks' },
    //     ]);
    //     this.router = router;
    //
    //     if (Cookies.get('username') === null) {
    //       config.title = 'MVP';
    //       config.map(loggedOutRoutes);
    //       this.router = router;
    //       return;
    //     }
    // }

    activate() {
      var username = '';
      var authToken = '';
      //this.userText = '';

      username = Cookies.get('username');
      authToken = "Token " + Cookies.get('token');

      this.userInfo = [];
      this.userInfo.push(username);

      console.log(this.userInfo);

      httpClient.fetch('https://remix.ist/accounts/myaccount', {
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
