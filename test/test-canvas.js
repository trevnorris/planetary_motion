'use strict';

const { openSync, closeSync, readSync, readFileSync, statSync, writeFileSync } = require('fs');
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(5000, 5000);
const ctx = canvas.getContext('2d');

//const coords = readFileSync('/tmp/planet-positions-out.txt').toString().trim().split('\n').map(e => JSON.parse(e));

/*
const mercury = new Float64Array(readFileSync('/tmp/mercury-positions.bin').buffer);
const venus = new Float64Array(readFileSync('/tmp/venus-positions.bin').buffer);
const earth = new Float64Array(readFileSync('/tmp/earth-positions.bin').buffer);
const jupiter = new Float64Array(readFileSync('/tmp/jupiter-positions.bin').buffer);
const saturn = new Float64Array(readFileSync('/tmp/saturn-positions.bin').buffer);
const uranus = new Float64Array(readFileSync('/tmp/uranus-positions.bin').buffer);
*/

const planet_list = [/*'saturn', */'jupiter',/* mars*/'earth', 'venus', 'mercury'];
let max_val = 0;

/*
for (let e of coords) {
  if (e[0] > max_val) max_val = e[0];
  if (e[1] > max_val) max_val = e[1];
  if (e[2] > max_val) max_val = e[2];
}
*/

function* read_bin_stream(path) {
  // Just under 32KB allocation, enough for 1365 points 8 bit x 3 degrees.
  const buf = new Float64Array(1365);
  const fd = openSync(path);
  let bytes_read = 0;
  do {
    bytes_read = readSync(fd, buf, 0, buf.byteLength, null);
    yield (bytes_read === buf.byteLength) ? buf : buf.slice(0, bytes_read / 8);
  } while (bytes_read > 0);
  closeSync(fd);
}

/*
const bin = read_bin_stream('/tmp/earth-positions.bin');
for (let e = bin.next(); !e.done; e = bin.next()) {
  console.log(e.value.byteLength);
}
return;
*/

function transform_coord(x, y) {
  const r = [0, 0];
  r[0] = canvas.width / 2 * 0.9 * (x / max_val) + canvas.width / 2 - canvas.width * 0.02;
  r[1] = canvas.width / 2 * 0.9 * (y / max_val) + canvas.width / 2 - canvas.width * 0.02;
  return r;
}

/*
function draw_orbit(p) {
  ctx.moveTo(p[0], p[1]);
  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  for (let i = 0; i < p.length; i += 3) {
    const e = transform_coord(p[i], p[i + 1]);
    ctx.lineTo(e[0], e[1]);
  }
  ctx.stroke();
}
*/

const points = statSync(`${planet_list[0]}-positions.bin`).size / 8 / 3;

const NSHADES = points;
const colors = require('colormap')({
  colormap: 'oxygen',
  nshades: NSHADES,
  format: 'hex',
  alpha: 1,
});

function draw_orbit_bin(path, ctx) {
  const bin = read_bin_stream(path);
  let { done, value } = bin.next();
/* debug:start */
let max = NSHADES;
let iter = 0;
/* debug:stop */
  if (done) { return }
  ctx.moveTo(value[0], value[1]);
  for (; !done && max > 0; { done, value } = bin.next()) {
  ctx.beginPath();
    for (let i = 0; i < value.length && --max > 0; i += 3) {
      ctx.strokeStyle = colors[iter++ % NSHADES];
      ctx.lineTo(...transform_coord(value[i], value[i + 1]));
    }
  ctx.stroke();
  }
}

//const tc = coords.map(e => transform_coord(e));

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

max_val = 5;

planet_list.forEach(e => {
  draw_orbit_bin(`/tmp/${e}-positions.bin`, ctx);
});
//draw_orbit_bin('/tmp/earth-positions.bin', ctx);
//draw_orbit_bin('/tmp/jupiter-positions.bin', ctx);

//draw_orbit(mercury);
//draw_orbit(venus);
//draw_orbit(earth);

//draw_orbit(jupiter);
//draw_orbit(saturn);
//draw_orbit(uranus);

/*
ctx.beginPath();
ctx.fillStyle = '#F1C40F';
ctx.moveTo(canvas.width / 2 + 10, canvas.height / 2);
ctx.arc(canvas.width / 2, canvas.width / 2, 10, 0, Math.PI * 2, false);
ctx.fill();
*/

/*
  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.moveTo(tc[0], tc[1]);
  for (let e of tc) {
    ctx.lineTo(e[0], e[1]);
  }
  ctx.stroke();
*/


writeFileSync('/tmp/test-canvas.png', canvas.toBuffer());
  //'image/png',
  //{
    //compressionLevel: 8,
    //filters: canvas.PNG_ALL_FILTERS,
  //}));
