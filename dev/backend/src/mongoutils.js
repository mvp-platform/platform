const incRef = async function (author, uuid) {
  await global.db.collection('refs').update({ author, uuid }, { $inc: { count: 1 } });
};

const decRef = async function (author, uuid) {
  await global.db.collection('refs').update({ author, uuid }, { $inc: { count: -1 } });
};

const countRefs = async function (old, newRef, user) {
  // oh dear, this is not what I intended to be writing today
  // 100% USDA Prime Code
  const oldComp = old.map(e => `${e[0]},${e[1]}`); // join would give all elements; we don't want that
  const newComp = newRef.map(e => `${e[0]},${e[1]}`);

  for (const i in oldComp) {
    if (!newComp.includes(oldComp[i]) && old[i][0] === user) {
      decRef(old[i][0], old[i][1]);
    }
  }

  for (const i in newComp) {
    if (!oldComp.includes(newComp[i]) && newRef[i][0] === user) {
      incRef(newRef[i][0], newRef[i][1]);
    }
  }
};

module.exports = { incRef, decRef, countRefs };
