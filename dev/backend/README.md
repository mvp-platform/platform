Backend
=======

Requirements
------------

* `node` and `npm` [(install guide)](https://docs.npmjs.com/getting-started/installing-node)


* Elasticsearch [(install guide)](https://www.elastic.co/guide/en/elasticsearch/guide/current/running-elasticsearch.html)

* MongoDB [(install guide)](https://docs.mongodb.com/manual/installation/)

MongoDB must run on the same system you wish to run the backend on. Elasticsearch can be on a different system; if so, set the `ELASTIC` environment variable to the address and port combo (ex: `elastic.example.com:9200`).

Setting up
----------

Install all Node dependencies with `npm`:

> `$ cd /path/to/mvp_platform/dev/backend`

> `$ npm install`

Running
-------

To run the server, simply run:

> `$ npm start`

This will start the server running on localhost, port 8000:

> `$ curl http://localhost:8000`

(This will return a 404, as there is no root page, if the server is successfully running.)

Using
-----

To set this up to be accessible to the world, set up an `nginx` or `haproxy` reverse proxy in front.
