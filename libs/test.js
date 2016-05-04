'use strict';
const Promise = require('bluebird');

function times2(x) {
  return new Promise((accept) => {
    setTimeout(() => {
      accept(x * 2);
    }, 100);
  });
}

async function times4(x) {
  x = await times2(x);
  x = await times2(x);
  return x;
}

const foo = async function() {
  let x = 2;
  x = await times4(x);
  console.log(x);
};

foo().catch((err) => {
  console.log('Error: ' + err);
});
