'use strict';

const ITER = 1e7;
const { writeSync } = require('fs');
const { format } = require('util');
const print = (...a) => writeSync(1, format(...a) + '\n');

const Vector = require('../lib/vector.js');
const rdm = Math.random;

const testList = {
  new_vector,
  mul,
  clone,
  mag,
  magSq,
};

run_test(process.argv.length > 2 ? process.argv.slice(2) : Object.keys(testList));

function run_test(arr) {
  for (let e of arr) {
    testList[e]();
  }
}


function new_vector() {
  const t = process.hrtime();
  for (let i = 0; i < ITER; i++) {
    new Vector(rdm(), rdm(), rdm());
    //new Vector(i + 1, i + 2, i + 3);
  }
  printTime('new Vector:', process.hrtime(t), ITER);
}

function mul() {
  const v1 = new Vector(rdm(), rdm(), rdm());
  const v2 = new Vector(rdm(), rdm(), rdm());
  const { x, y, z } = v2;
  const t = process.hrtime();
  for (let i = 0; i < ITER; i++) {
    v1.mul(v2);
    //v1.mul([x, y, z]);
  }
  printTime('vector.mul:', process.hrtime(t), ITER);
}

function clone() {
  const v = new Vector(rdm(), rdm(), rdm());
  const t = process.hrtime();
  for (let i = 0; i < ITER; i++) {
    v.clone();
  }
  printTime('vector.clone:', process.hrtime(t), ITER);
}

function mag() {
  const v1 = new Vector(rdm(), rdm(), rdm());
  const v2 = new Vector(rdm(), rdm(), rdm());
  const t = process.hrtime();
  for (let i = 0; i < ITER; i++) {
    v1.mag(v2);
  }
  printTime('vector.mag:', process.hrtime(t), ITER);
}

function magSq() {
  const v1 = new Vector(rdm(), rdm(), rdm());
  const v2 = new Vector(rdm(), rdm(), rdm());
  const t = process.hrtime();
  for (let i = 0; i < ITER; i++) {
    v1.magSq(v2);
  }
  printTime('vector.magSq:', process.hrtime(t), ITER);
}



function printTime(msg, t, iter) {
  const op_txt = (iter === 1) ? '' : '/op';
  let ops = (t[0] + t[1] / 1e9) / iter;

  if (ops > 1) {
    print(msg, ops.toFixed(2), 'sec' + op_txt);
  } else if ((ops *= 1e3) > 1) {
    print(msg, ops.toFixed(2), 'ms' + op_txt);
  } else if ((ops *= 1e3) > 1) {
    print(msg, ops.toFixed(2), 'μs' + op_txt);
  } else {
    print(msg, (ops * 1e3).toFixed(2), 'ns' + op_txt);
  }
}

