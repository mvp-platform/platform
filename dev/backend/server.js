'use strict';

const Hapi = require('hapi');
const promisify = require("es6-promisify");
var MongoClient = require('mongodb').MongoClient;
var connect = promisify(MongoClient.connect);
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs-extra');
var copyFile = promisify(fs.copy);
const assert = require("assert");
const elasticsearch = require('elasticsearch');

let elasticConnection = 'localhost:9200';
if (process.env.ELASTIC) {
  elasticConnection = process.env.ELASTIC;
}

const books = require('./src/books');
const scraps = require('./src/scraps');
const chapters = require('./src/chapters');
const accounts = require('./src/accounts');
const users = require('./src/users');
const search = require('./src/search');

// we need a workspace for things like pdf generation
global.storage = process.cwd() + '/data/storage/';
global.renders = process.cwd() + '/data/renders';
global.root = process.cwd();
process.chdir(global.renders);


// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: 8000,
    routes: {
      cors: true,
      response: {
        emptyStatusCode: 204
      }
    }
});

global.search = new elasticsearch.Client({
  host: elasticConnection,
  log: 'trace'
});

server.register(require('inert'), () => {});


// register books/ endpoints
books.register(server);
// register chapters/ endpoints
chapters.register(server);
// register scraps/ endpoints
scraps.register(server);
// register users/ endpoints
users.register(server);
// register accounts/ endpoints
accounts.register(server);
// register search endpoint
search.register(server);

// Start the server
server.start(async (err) => {
    await fs.copy(global.root + '/assets/fvextra.sty', global.renders + '/fvextra.sty');
    await fs.copy(global.root + '/assets/upquote.sty', global.renders + '/upquote.sty');

    var mongo = 'mongodb://localhost:27017/mvp';
    global.db = await connect(mongo);

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
