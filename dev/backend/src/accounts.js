'use strict';

var GoogleAuth = require('google-auth-library');
var hat = require('hat');
var lescape = require('escape-latex');
var createHash = require('sha.js');

const book = require('../../scrapjs/parts/book');
const scrap = require('../../scrapjs/parts/scrap');
const chapter = require('../../scrapjs/parts/chapter');

const fs = require('fs');
const CLIENT_ID = "643825511576-aecm78ba0gdc5aild94hi0on5lrrobma.apps.googleusercontent.com";

const fullNames = async function(authors) {
  var authorFullNames = [];
  for (let author of authors) {
    var cursor = await db.collection('users').find({userid: author, name: {$exists: true}});
    var name = await cursor.toArray();
    if (name.length === 0) {
      authorFullNames.push(author);
    } else {
      authorFullNames.push(lescape(name[0].name));
    }
  }
  return authorFullNames;
}

const reconstitute = {
  book: book.reconstitute,
  chapter: chapter.reconstitute,
  scrap: scrap.reconstitute
}

const unfavoriteThing = async function(user, type, author, uuid) {
  await db.collection('favorites').remove({userid: user, type: type, author: author, uuid: uuid});
  return;
}

const favoriteThing = async function(user, type, author, uuid) {
  var cursor = await db.collection('favorites').find({userid: user, type: type, author: author, uuid: uuid});
  var isFaved = (await cursor.toArray()).length === 1;
  if (!isFaved) {
    let obj = await reconstitute[type](author, uuid);
    if (type === "scrap") {
      await db.collection('favorites').insertOne({userid: user, type: type, author: author, uuid: uuid, text: obj.text});
    } else {
      await db.collection('favorites').insertOne({userid: user, type: type, author: author, uuid: uuid, name: obj.name});
    }
  }
}

const verifylogin = async function(request) {
  var header = request.headers.authorization;
  if (header != undefined && header.substring(0, 6) == "Token ") {
    var token = header.substring(6);
  } else {
    return {success: false, reason: "invalid authorization header"};
  }
  var sha256 = createHash('sha256');
  var h = sha256.update(token, 'utf8').digest('hex');
  var cursor = await db.collection('users').find({token: h});
  var user_blob = await cursor.toArray();
  if (user_blob.length < 1) {
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

const getAccount = async function(request, reply) {
  var header = request.headers.authorization;
  if (header != undefined && header.substring(0, 6) == "Token ") {
    var token = header.substring(6);
  } else {
    return reply({error: "invalid authorization header"});
  }

  var sha256 = createHash('sha256');
  var h = sha256.update(token, 'utf8').digest('hex');
  var cursor = await db.collection('users').find({token: h});
  var user_blob = await cursor.toArray();
  if (user_blob.length < 1) {
    return reply({error: "invalid token"});
  }
  delete user_blob[0]._id;
  delete user_blob[0].token;
  return reply(user_blob[0]);
}

const updateAccount = async function(request, reply) {
  var login = await verifylogin(request);
  if (!login.success) {
    return reply({error: "could not verify identity"}).code(403);
  }

  if (Object.keys(request.payload).length !== 1 || Object.keys(request.payload)[0] !== "name") {
    return reply({error: "can only update name"}).code(400);
  }

  await db.collection('users').update({userid: login.username}, {$set: {name: request.payload.name}}, {multi: true});
  return reply({success: true, name: request.payload.name});
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
      var sha256 = createHash('sha256');
      var h = sha256.update(token, 'utf8').digest('hex');
      await db.collection('users').insertOne({userid: username, token: h, name: payload['name']});
      return reply({username: username, token: token});
  });
}

const favorites = async function(request, reply) {
  var login = await verifylogin(request);
  if (!login.success) {
    return reply({error: "could not verify identity"}).code(403);
  }
  let types = ['book', 'chapter', 'scrap'];
  if (request.query.type) {
    if (Array.isArray(request.query.type)) {
      types = request.query.type;
    } else {
      types = [request.query.type];
    }
  }
  var cursor = await db.collection('favorites').find({userid: login.username, type: {$in: types}});
  var resp = (await cursor.toArray()).map(fav => {
    delete fav._id; // mongodb internal favorite id
    delete fav.userid; // favoriter id
    return fav;
  });
  reply(resp);
}

const routes = [{
    method: 'POST',
    path: '/accounts/login',
    handler: login
  },
  {
    method: 'POST',
    path: '/accounts/myaccount',
    handler: updateAccount
  },
  {
    method: 'GET',
    path: '/accounts/myaccount',
    handler: getAccount
  },
  {
    method: 'GET',
    path: '/login',
    handler: loginPage
  },
  {
    method: 'GET',
    path: '/favorites',
    handler: favorites
  }
];

const register = function(server) {
  for (let route of routes) {
    server.route(route);
  }
}

module.exports = {favoriteThing: favoriteThing, unfavoriteThing: unfavoriteThing, register: register, verifylogin: verifylogin, fullNames: fullNames};
