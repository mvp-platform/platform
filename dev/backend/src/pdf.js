const execCb = require('child_process').exec;
const promisify = require('es6-promisify');
const path = require('path');
const fs = require('fs');

const writeFile = promisify(fs.writeFile);
const chmod = promisify(fs.chmod);
const exec = promisify(execCb);

const gen = async function (latext) {
  const jobname = Math.random().toString(36).substring(7);
  await writeFile(`${jobname}.tex`, latext);
  await exec(`xelatex ${jobname}.tex`);
  // second run for ToC
  await exec(`xelatex ${jobname}.tex`);
  const p = path.join(process.cwd(), `${jobname}.pdf`);
  await chmod(p, '644');
  return p;
};

module.exports = { gen };
