'use strict';

const countRefs = async function(old, newRef, user) {
  // oh dear, this is not what I intended to be writing today
  // 100% USDA Prime Code
  let oldComp = old.map(e => e[0] + "," + e[1]); // join would give all elements; we don't want that
  let newComp = newRef.map(e => e[0] + "," + e[1]);

  for (let i in oldComp) {
    if (!newComp.includes(i) && old[i][0] === user) {
      decRef(old[i][0], old[i][1]);
    }
  }

  for (let i in newComp) {
    if (!oldComp.includes(i) && newRef[i][0] === user) {
      decRef(newRef[i][0], newRef[i][1]);
    }
  }
  return;
}

const incRef = async function(author, uuid) {
  await db.collection('favorites').update({author: author, uuid: uuid}, {$inc: {count: 1}});
  return;
}

const decRef = async function(author, uuid) {
  await db.collection('favorites').update({author: author, uuid: uuid}, {$inc: {count: -1}});
  return;
}

module.exports = {incRef: incRef, decRef: decRef, countRefs: countRefs};
