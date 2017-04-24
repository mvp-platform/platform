'use strict';

const fs = require('fs');

// /users/{username}
const getUserById = function(request, reply) {
  return reply({username: request.params.username});
}

const routes = [{
    method: 'GET',
    path: '/users/{username}',
    handler: getUserById
  }
];

const register = function(server) {
  for (let route of routes) {
    server.route(route);
  }
}

module.exports = {register: register};
