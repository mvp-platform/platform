'use strict';

var GoogleAuth = require('google-auth-library');
var mongodb = require('mongodb');
var hat = require('hat');

const fs = require('fs');
const CLIENT_ID = "643825511576-aecm78ba0gdc5aild94hi0on5lrrobma.apps.googleusercontent.com";

const verifylogin = async function(request) {
  var header = request.headers.authorization;
  if (header != undefined && header.substring(0, 6) == "Token ") {
    var token = header.substring(6);
  } else {
    return {success: false, reason: "invalid authorization header"};
  }
  var cursor = await db.collection('users').find({token: token});
  var user_blob = await cursor.toArray();
  if (user_blob.length != 1) {
    return {success: false, reason: "account does not exist"};
  }
  return {success: true, username: user_blob[0].userid};
};

const loginPage = async function(request, reply) {
  return reply(`<html lang="en">
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
    <meta name="google-signin-scope" content="profile email">
    <meta name="google-signin-client_id" content="643825511576-aecm78ba0gdc5aild94hi0on5lrrobma.apps.googleusercontent.com">
    <script src="https://apis.google.com/js/platform.js" async defer></script>
  </head>
  <body>
    <div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
    <script>
      var SERVER = "http://remix.ist:8000";
      function onSignIn(googleUser) {
        // The ID token you need to pass to your backend:
        var id_token = googleUser.getAuthResponse().id_token;
        $.post( SERVER + "/accounts/login", {token: id_token}, function( data ) {
          console.log(data);
        });
      };
    </script>
  </body>
</html>
`)
}

// /accounts/login
const login = async function(request, reply) {
  var auth = new GoogleAuth;
  var client = new auth.OAuth2(CLIENT_ID, '', '');
  client.verifyIdToken(
    request.payload.token,
    CLIENT_ID,
    async function(e, login) {
      var payload = login.getPayload();
      var userid = payload['sub'];
      var token = hat();
      var username = payload['name'].replace(/\s/g,'').toLowerCase();
      await db.collection('users').insertOne({userid: username, token: token});
      return reply({username: username, token: token});
  });

}

const routes = [{
    method: 'POST',
    path: '/accounts/login',
    handler: login
  }, {
      method: 'GET',
      path: '/login',
      handler: loginPage
    }
];

const register = function(server) {
  for (let route of routes) {
    server.route(route);
  }
}

module.exports = {register: register, verifylogin: verifylogin};
