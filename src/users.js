'use strict';

const fs = require('fs');
const promisify = require("es6-promisify");
const readdir = promisify(fs.readdir);
const book = require('../../scrapjs/parts/book');

// /users/{username}
const getUserById = function(request, reply) {
  return reply({username: request.params.username});
}

// /users/{username}/books
const getUsersBooks = async function(request, reply) {
  let books = [];
  try {
    let dirs = await readdir('/tmp/mvp/' + request.params.username + '/book');
    for (let dir of dirs) {
      let b = await book.reconstitute(request.params.username, dir);
      books.push(b);
    }
  } catch (e) {
    // TODO should return successful but empty for existing user with no books
    console.error("/users/" + request.params.username + "/books unsuccessful", e)
    return reply({error: "no books for user " + request.params.username + "found"}).code(404);
  }
  return reply(books);
}



const routes = [{
    method: 'GET',
    path: '/users/{username}',
    handler: getUserById
  },
  {
    method: 'GET',
    path: '/users/{username}/books',
    handler: getUsersBooks
  }
];

const register = function(server) {
  for (let route of routes) {
    server.route(route);
  }
}

module.exports = {register: register};
