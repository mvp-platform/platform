'use strict';

const Hapi = require('hapi');
const books = require('./src/books');
const scraps = require('./src/scraps');
const chapters = require('./src/chapters');
const accounts = require('./src/accounts');
const users = require('./src/users');

// we need a workspace for things like pdf generation
process.chdir('/tmp/mvp_backend');


// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: 8000,
    routes: { cors: true }
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

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
