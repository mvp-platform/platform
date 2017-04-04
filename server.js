'use strict';

const Hapi = require('hapi');
const books = require('./src/books');

// we need a workspace for things like pdf generation
process.chdir('/tmp/mvp_backend');


// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

server.register(require('inert'), () => {});


// register books endpoints
books.register(server);

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
