'use strict';

const searchEndpoint = async function(request, reply) {
  if (request.query.q === undefined) {
    return reply({error: "query parameter q must be defined!"}).code(400);
  }

  // get all matching chapters/books (stored by name)
  let q = {body: {query: {match: {name: decodeURIComponent(request.query.q)}}}};
  // get all matching scraps (stored by text)
  let scrap_q = {body: {query: {match: {text: decodeURIComponent(request.query.q)}}}};
  let hits = await global.search.search(q);
  let scrap_hits = await global.search.search(scrap_q);
  hits = hits.hits.hits.concat(scrap_hits.hits.hits); // yes, that's really where results live

  hits = hits.filter(function(hit) {
    if (request.query.type) {
      if (request.query.type.includes(hit._type)) {
          return true;
      } else {
        return false;
      }
    }
    return true;
  });

  hits = hits.filter(function(hit) {
    if (request.query.user) {
      if (hit._source.author == request.query.user) {
          return true;
      } else {
        return false;
      }
    }
    return true;
  });

  return reply({total: hits.length, hits: hits});
}

const routes = [
  {
    method: 'GET',
    path: '/search',
    handler: searchEndpoint
  }
];

const register = function(server) {
  for (let route of routes) {
    server.route(route);
  }
}

module.exports = {register: register};
