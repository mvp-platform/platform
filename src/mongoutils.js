'use strict';

const incRef = async function(author, uuid) {
  await db.collection('favorites').update({author: author, uuid: uuid}, {$inc: {count: 1}});
  return;
}

const decRef = async function(author, uuid) {
  await db.collection('favorites').update({author: author, uuid: uuid}, {$inc: {count: -1}});
  return;
}

module.exports = {incRef: incRef, decRef: decRef};
