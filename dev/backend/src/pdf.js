"use strict";

var execCb = require('child_process').exec;
var promisify = require("es6-promisify");
var exec = promisify(execCb);
var path = require("path");
var fs = require("fs");
var writeFile = promisify(fs.writeFile);
var chmod = promisify(fs.chmod);

var gen = async function(latext) {
  const jobname = Math.random().toString(36).substring(7);
  let f = await writeFile(jobname + ".tex", latext);
  let v = await exec("xelatex " + jobname + ".tex");
  // second run for ToC
  let v = await exec("xelatex " + jobname + ".tex");
  let p = path.join(process.cwd(), jobname + ".pdf");
  await chmod(p, '644');
  return p;
}

module.exports = {gen: gen}
