'use strict';
const execCb = require('child_process').exec;
const promisify = require('es6-promisify');
const Hapi = require('hapi');

const exec = promisify(execCb);

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: 8080
});


const pushHook = async function (request, reply) {
  console.log("Getting updated repo...");
  await exec(`git pull`);
  return reply();
};

server.route({
  method: 'POST',
  path: '/hooks/push',
  handler: pushHook,
});

// Start the server
server.start(async (err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
