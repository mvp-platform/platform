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
      return reply({username: request.params.userid, token: token});
  });

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

module.exports = {register: register, verifylogin: verifylogin};
