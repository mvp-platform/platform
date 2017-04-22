'use strict';

const searchEndpoint = async function(request, reply) {
  if (request.query.q === undefined) {
    return reply({error: "query parameter q must be defined!"}).code(400);
  }
  let q = {body: {query: {fuzzy: {name: request.query.q}}}};
  let r = await global.search.search(q);
  if (request.query.type) {
    let hits = [];
    let typelist = request.query.type;
    if (!Array.isArray(typelist)) {
      typelist = [typelist];
    }
    // I'll give this one a "wat" for hits.hits o.O
    for (let [key, hit] of Object.entries(r.hits.hits)) {
      if (typelist.includes(hit._type)) {
        hits.push(hit);
      }
    }
    return reply({total: hits.length, hits: hits});
  }

  return reply(r.hits);
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
