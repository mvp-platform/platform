const GoogleAuth = require('google-auth-library');
const hat = require('hat');
const lescape = require('escape-latex');
const createHash = require('sha.js');

const book = require('../../scrapjs/parts/book');
const scrap = require('../../scrapjs/parts/scrap');
const chapter = require('../../scrapjs/parts/chapter');

const CLIENT_ID = '643825511576-aecm78ba0gdc5aild94hi0on5lrrobma.apps.googleusercontent.com';

const fullNames = async function (authors) {
  const authorFullNames = [];
  for (const author of authors) {
    const cursor = await global.db.collection('users').find({ userid: author, name: { $exists: true } });
    const name = await cursor.toArray();
    if (name.length === 0) {
      authorFullNames.push(author);
    } else {
      authorFullNames.push(lescape(name[0].name));
    }
  }
  return authorFullNames;
};

const reconstitute = {
  book: book.reconstitute,
  chapter: chapter.reconstitute,
  scrap: scrap.reconstitute,
};

const unfavoriteThing = async function (user, type, author, uuid) {
  await global.db.collection('favorites').remove({ userid: user, type, author, uuid });
};

const favoriteThing = async function (user, type, author, uuid) {
  const cursor = await global.db.collection('favorites').find({ userid: user, type, author, uuid });
  const isFaved = (await cursor.toArray()).length === 1;
  if (!isFaved) {
    const obj = await reconstitute[type](author, uuid);
    if (type === 'scrap') {
      await global.db.collection('favorites').insertOne({ userid: user, type, author, uuid, text: obj.text });
    } else {
      await global.db.collection('favorites').insertOne({ userid: user, type, author, uuid, name: obj.name });
    }
  }
};

const verifylogin = async function (request) {
  const header = request.headers.authorization;
  if (header === undefined || header.substring(0, 6) !== 'Token ') {
    return { success: false, reason: 'invalid authorization header' };
  }
  const token = header.substring(6);
  const sha256 = createHash('sha256');
  const h = sha256.update(token, 'utf8').digest('hex');
  const cursor = await global.db.collection('users').find({ token: h });
  const userBlob = await cursor.toArray();
  if (userBlob.length < 1) {
    return { success: false, reason: 'account does not exist' };
  }
  return { success: true, username: userBlob[0].userid };
};

const loginPage = async function (request, reply) {
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
`);
};

const getAccount = async function (request, reply) {
  const header = request.headers.authorization;
  if (header === undefined || header.substring(0, 6) !== 'Token ') {
    return { success: false, reason: 'invalid authorization header' };
  }
  const token = header.substring(6);

  const sha256 = createHash('sha256');
  const h = sha256.update(token, 'utf8').digest('hex');
  const cursor = await global.db.collection('users').find({ token: h });
  const userBlob = await cursor.toArray();
  if (userBlob.length < 1) {
    return reply({ error: 'invalid token' });
  }
  delete userBlob[0]._id;
  delete userBlob[0].token;
  return reply(userBlob[0]);
};

const updateAccount = async function (request, reply) {
  const login = await verifylogin(request);
  if (!login.success) {
    return reply({ error: 'could not verify identity' }).code(403);
  }

  if (Object.keys(request.payload).length !== 1 || Object.keys(request.payload)[0] !== 'name') {
    return reply({ error: 'can only update name' }).code(400);
  }

  await global.db.collection('users').update({ userid: login.username }, { $set: { name: request.payload.name } }, { multi: true });
  return reply({ success: true, name: request.payload.name });
};

// /accounts/login
const postLogin = async function (request, reply) {
  const auth = new GoogleAuth();
  const client = new auth.OAuth2(CLIENT_ID, '', '');
  return client.verifyIdToken(
    request.payload.token,
    CLIENT_ID,
    async (e, login) => {
      const payload = login.getPayload();
      // const userid = payload.sub; should use this?
      const token = hat();
      const username = payload.name.replace(/\s/g, '').toLowerCase();
      const sha256 = createHash('sha256');
      const h = sha256.update(token, 'utf8').digest('hex');
      await global.db.collection('users').insertOne({ userid: username, token: h, name: payload.name });
      return reply({ username, token });
    });
};

const favorites = async function (request, reply) {
  const login = await verifylogin(request);
  if (!login.success) {
    return reply({ error: 'could not verify identity' }).code(403);
  }
  let types = ['book', 'chapter', 'scrap'];
  if (request.query.type) {
    if (Array.isArray(request.query.type)) {
      types = request.query.type;
    } else {
      types = [request.query.type];
    }
  }
  const cursor = await global.db.collection('favorites').find({ userid: login.username, type: { $in: types } });
  const resp = (await cursor.toArray()).map((fav) => {
    delete fav._id; // mongodb internal favorite id
    delete fav.userid; // favoriter id
    return fav;
  });
  return reply(resp);
};

const routes = [{
  method: 'POST',
  path: '/accounts/login',
  handler: postLogin,
},
{
  method: 'POST',
  path: '/accounts/myaccount',
  handler: updateAccount,
},
{
  method: 'GET',
  path: '/accounts/myaccount',
  handler: getAccount,
},
{
  method: 'GET',
  path: '/login',
  handler: loginPage,
},
{
  method: 'GET',
  path: '/favorites',
  handler: favorites,
},
];

const register = function (server) {
  for (const route of routes) {
    server.route(route);
  }
};

module.exports = { favoriteThing, unfavoriteThing, register, verifylogin, fullNames };
