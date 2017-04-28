const scrap = require('../../scrapjs/parts/scrap');
const mustache = require('mustache');
const accounts = require('./accounts');
const pdf = require('./pdf');
const fs = require('fs-extra');
const promisify = require('es6-promisify');
const lescape = require('escape-latex');

const ensureDir = promisify(fs.mkdirs);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

const scrapTmpl = `

\\documentclass{article}
\\usepackage{graphicx}
\\usepackage{setspace}
\\usepackage{comment}
\\usepackage{bigstrut}
\\usepackage{geometry}
\\usepackage{supertabular}
\\usepackage{tabu}
\\usepackage{hyperref}
\\usepackage{url}
\\hypersetup{
  colorlinks=true, linkcolor=blue, citecolor=blue, filecolor=blue, urlcolor=blue}
\\geometry{textheight=9.5in, textwidth=7in}
\\usepackage{fontspec}
\\defaultfontfeatures{Ligatures=TeX}
\\usepackage[small,sf,bf]{titlesec}
\\usepackage{fvextra}
\\DefineVerbatimEnvironment{plainraw}
  {Verbatim}
  {fontfamily=\\rmdefault,breaklines,breaksymbolleft={}}
\\begin{document}

\\begin{plainraw}

{{{ body }}}
\\end{plainraw}
\\end{document}
`;

const getUnassociatedScraps = async function (request, reply) {
  const login = await accounts.verifylogin(request, reply);
  if (!login.success) {
    return reply({ error: 'could not verify identity', reason: login.reason }).code(403);
  }
  const cursor = await global.db.collection('refs').find({ author: login.username, type: 'scrap', count: 0 });
  const unassoc = await cursor.toArray();
  unassoc.map((e) => {
    delete e._id;
    delete e.count;
    return e;
  });
  return reply(unassoc);
};

const getScrapById = async function (request, reply) {
  const s = await scrap.reconstitute(request.params.author, request.params.id);
  return reply(s);
};

const postScrapById = async function (request, reply) {
  const login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({ error: 'could not verify identity' }).code(403);
  }
  if (login.username !== request.params.author) {
    return reply({ error: 'not your scrap!' }).code(403);
  }
  const s = await scrap.reconstitute(request.params.author, request.params.id);
  if (s.image) {
    return reply({ error: 'cannot update images' }).code(400);
  }
  if (request.payload.tags) {
    if (!Array.isArray(request.payload.tags)) {
      return reply({ error: 'tags must be array' }).code(400);
    }
    for (const item of request.payload.tags) {
      if (typeof item !== 'string') {
        return reply({ error: 'tags must only be strings' }).code(400);
      }
    }
  }
  const err = await s.update(request.payload);
  if (err.error) {
    return reply(err).code(403);
  }
  await global.search.update({
    index: 'mvp',
    type: 'scrap',
    id: `${s.author}-${s.uuid}`,
    body: {
      doc: s,
    },
  });
  return reply(err);
};

const generateScrapPdf = async function (request, reply) {
  const s = await scrap.reconstitute(request.params.author, request.params.id);

  let [scrapText, authors] = await s.getText();
  const authorFullNames = await accounts.fullNames(authors);
  const authorText = authorFullNames.join(' \\and ');
  if (s.latex) {
    scrapText = `\n\\end{plainraw}\n${scrapText}\n\\begin{plainraw}\n`;
  }
  const info = {
    title: lescape(s.name),
    author: authorText,
    body: scrapText,
  };
  const laText = mustache.render(scrapTmpl, info); // lol laText
  const pdfPath = await pdf.gen(laText);

  return reply.file(pdfPath);
};

const getScrapHistory = async function (request, reply) {
  const s = await scrap.reconstitute(request.params.author, request.params.id);
  const versions = await s.previousVersions();
  return reply(versions.map(v => [v[0], v[1]])); // remove the Commit object field
};

const postNewScrap = async function (request, reply) {
  const login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({ error: 'could not verify identity' }).code(403);
  }
  if (request.payload.author !== login.username) {
    return reply({ error: `can only create scraps for ${login.username}` }).code(403);
  }
  if (request.payload.author === undefined) {
    return reply({ error: 'must define author' }).code(400);
  }
  let text = request.payload.text;
  if (text === undefined) {
    text = '';
  }
  const scr = new scrap.Scrap(text, request.payload.author);
  if (request.payload.latex === true) {
    scr.latex = true;
  }
  if (request.payload.tags) {
    if (!Array.isArray(request.payload.tags)) {
      return reply({ error: 'tags must be array' }).code(400);
    }
    for (const item of request.payload.tags) {
      if (typeof item !== 'string') {
        return reply({ error: 'tags must only be strings' }).code(400);
      }
    }
  }
  scr.tags = request.payload.tags;
  await scr.save('Created new scrap');

  await global.search.create({
    index: 'mvp',
    type: 'scrap',
    id: `${scr.author}-${scr.uuid}`,
    body: {
      tags: scr.tags,
      image: scr.image,
      latex: scr.latex,
      author: scr.author,
      text: scr.text,
      uuid: scr.uuid,
    },
  });
  await global.db.collection('refs').insertOne({ author: request.payload.author, text, type: 'scrap', uuid: scr.uuid, count: 0 });
  return reply(scr);
};

const postNewImage = async function (request, reply) {
  const login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({ error: 'could not verify identity' }).code(403);
  }

  if (request.payload.image) {
    const image = request.payload.image;
    let tags = request.payload.tags;
    if (tags === undefined) {
      tags = ['image'];
    } else {
      tags.push('image');
    }
    const path = `${global.storage}images/${login.username}`;
    await ensureDir(path);
    const fn = `${path}/${Math.random().toString(36).substring(7)}`;
    await writeFile(fn, image);
    const scr = new scrap.Scrap(`\\includegraphics[width=\\textwidth]{${fn}}`, login.username);
    scr.image = true;
    scr.latex = true;
    scr.tags = tags;
    await scr.save('Created image');
    return reply(scr);
  }
  return reply({ error: 'must specify image' }).code(400);
};

// /scraps/{author}
const getScrapsByAuthor = async function (request, reply) {
  try {
    const dirs = await readdir(`${global.storage + request.params.author}/scrap`);
    const results = [];
    for (const dir of dirs) {
      const b = scrap.reconstitute(request.params.author, dir);
      results.push(b);
    }
    const scraps = await Promise.all(results);
    return reply(scraps);
  } catch (e) {
    // TODO should return successful but empty for existing user with no scraps
    return reply({ error: `no scraps for user ${request.params.author} found` }).code(404);
  }
};

// /scraps/{author}/{id}/fork
const forkScrapById = async function (request, reply) {
  const login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({ error: 'could not verify identity' }).code(403);
  }
  const s = await scrap.reconstitute(request.params.author, request.params.id);
  const sFork = await s.fork(login.username);
  return reply(sFork);
};

// /scraps/{author}/{id}/favorite
const favoriteScrapById = async function (request, reply) {
  const login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({ error: 'could not verify identity' }).code(403);
  }

  return reply(await accounts.favoriteThing(login.username, 'scrap', request.params.author, request.params.id));
};

// /scraps/{author}/{id}/favorite
const unfavoriteScrapById = async function (request, reply) {
  const login = await accounts.verifylogin(request);
  if (!login.success) {
    return reply({ error: 'could not verify identity' }).code(403);
  }

  return reply(await accounts.unfavoriteThing(login.username, 'scrap', request.params.author, request.params.id));
};

const routes = [{
  method: 'GET',
  path: '/scraps/{author}/{id}',
  handler: getScrapById,
},
{
  method: 'GET',
  path: '/scraps/{author}',
  handler: getScrapsByAuthor,
},
{
  method: 'POST',
  path: '/scraps/{author}/{id}',
  handler: postScrapById,
},
{
  method: 'POST',
  path: '/scraps/{author}/{id}/fork',
  handler: forkScrapById,
},
{
  method: 'POST',
  path: '/scraps/{author}/{id}/favorite',
  handler: favoriteScrapById,
},
{
  method: 'DELETE',
  path: '/scraps/{author}/{id}/favorite',
  handler: unfavoriteScrapById,
},
{
  method: 'GET',
  path: '/scraps/{author}/{id}/pdf',
  handler: generateScrapPdf,
},
{
  method: 'GET',
  path: '/scraps/unassociated',
  handler: getUnassociatedScraps,
},
{
  method: 'GET',
  path: '/scraps/{author}/{id}/history',
  handler: getScrapHistory,
},
{
  method: 'POST',
  path: '/scraps/new',
  handler: postNewScrap,
},
{
  method: 'POST',
  path: '/images/new',
  handler: postNewImage,
},
];

const register = function (server) {
  for (const route of routes) {
    server.route(route);
  }
};

module.exports = { register };
