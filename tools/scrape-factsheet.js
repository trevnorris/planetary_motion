'use strict';

const AU = 149597870700;

const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

const planet = 'mercury';
const url = `https://nssdc.gsfc.nasa.gov/planetary/factsheet/${planet}fact.html`;
let page = null;

try {
  page = fs.readFileSync(`/tmp/${planet.html}`).toString();
} catch (e) { }

if (page) {
  process_page(page);
  return;
}

https.get(url, res => {
  const data = [];
  res.on('data', chunk => data.push(chunk));
  res.on('end', () => {
    const page = Buffer.concat(data).toString();
    fs.writeFileSync(`/tmp/${planet.html}`, page);
    process_page(page);
  });
}).on('error', err => {
  console.error(err);
  process.exit();
});

function process_page(page) {
  const obj = {};
  const $ = cheerio.load(page);
  $('table tr').each((i, elem) => {
    const arr = $(elem).text().trim().split('\n').map(e => e.trim());
    if (arr[0] === 'Mass (1024 kg)')
      obj.MASS = 1e24 * arr[1];
    else if (arr[0] === 'Mean orbital velocity (km/s)')
      obj.MEAN_VELOCITY = 1e3 * arr[1];
    else if (arr[0] === 'Max. orbital velocity (km/s)')
      obj.MAX_VELOCITY = 1e3 * arr[1];
    else if (arr[0] === 'Min. orbital velocity (km/s)')
      obj.MIN_VELOCITY = 1e3 * arr[1];
    else if (arr[0] === 'Sidereal orbit period (days)')
      obj.PERIOD = +arr[1];
    //else if (arr[0] === '
  });
  $('body > pre').each((i, elem) => {
    const arr = $(elem).text().split('\n');
    arr.forEach(elem => {
      if (elem.startsWith('Orbital eccentricity'))
        obj.ECCENTRICITY = +elem.split(/\s+/g)[2];
      else if (elem.startsWith('Semimajor axis (AU)'))
        obj.SEMIMAJOR_AXIS = AU * elem.split(/\s+/g)[3];
      else if (elem.startsWith('Orbital inclination (deg)'))
        obj.INCLINATION = +elem.split(/\s+/g)[3];
    });
  });

  console.log(obj);
}
