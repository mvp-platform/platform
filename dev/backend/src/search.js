'use strict';

const searchEndpoint = async function(request, reply) {
  if (request.query.q === undefined) {
    return reply({error: "query parameter q must be defined!"}).code(400);
  }

  let queryText = decodeURIComponent(request.query.q);
  let q = {body: {
    "query": {
      "multi_match": {
        "query": queryText,
          "fields": ["name", "text", "tags"]
        }
    }
  }};
  let hits = await global.search.search(q);
  hits = hits.hits.hits; // yes, that's really where results live

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
