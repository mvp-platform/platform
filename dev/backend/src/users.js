// /users/{username}
const getUserById = function (request, reply) {
  return reply({ username: request.params.username });
};

const routes = [{
  method: 'GET',
  path: '/users/{username}',
  handler: getUserById,
},
];

const register = function (server) {
  for (const route of routes) {
    server.route(route);
  }
};

module.exports = { register };
