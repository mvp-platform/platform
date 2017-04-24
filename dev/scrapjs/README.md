ScrapJS
=======

Getting Started
---------------

To use, first make sure you have Node 7 or above. If you are using nvm, this can
be done with `nvm install 7.5.0`.

```
$ npm install
$ node --harmony-async-await example.js
```

This prints a complete `tex` file to stdout. To then render the file, just send
it to `pdflatex`:

```
$ mkdir test
$ node --harmony-async-await example.js > test/test.tex
$ pdflatex test/test.tex
```
