'use strict';

var GoogleAuth = require('google-auth-library');

const fs = require('fs');
const CLIENT_ID = "643825511576-aecm78ba0gdc5aild94hi0on5lrrobma.apps.googleusercontent.com";

// /accounts/login
const login = function(request, reply) {
  console.log(request.payload);
  var auth = new GoogleAuth;
  var client = new auth.OAuth2(CLIENT_ID, '', '');
  client.verifyIdToken(
    request.payload.token,
    CLIENT_ID,
    function(e, login) {
      var payload = login.getPayload();
      var userid = payload['sub'];
      console.log(payload);
      console.log(userid);
  });
  return reply({username: request.params.username});
}

const routes = [{
    method: 'POST',
    path: '/accounts/login',
    handler: login
  }
];

const register = function(server) {
  for (let route of routes) {
    server.route(route);
  }
}

module.exports = {register: register};
