'use strict';

const { readFileSync } = require('fs');
const https = require('https');
const cheerio = require('cheerio');

/*
const base_url = 'https://en.wikipedia.org/';

const $ = cheerio.load(readFileSync(process.argv[2]).toString());

$('div.mw-category-group ul li a').each((i, e) => {
  console.log(base_url + $(e).attr('href'));
});
*/

const links = readFileSync(process.argv[2]).toString().trim().split('\n').map(e => e.trim());

(function getData() {
  if (links.length === 0)
    return;
  const link = links.pop();

  https.get(link, (res) => {
    const chunks = [];
    res.on('error', (er) => { throw er });
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('close', () => {
      getStarData(Buffer.concat(chunks).toString(), link.split('/').pop());
      getData();
    });
  }).on('error', (er) => { throw er });
})();


function getStarData(html, name) {
  let $ = cheerio.load(html);
  const star = { name: decodeURIComponent(name) };
  const replace_vals = ['±', '+', ':', '(', '[', '\\', '/', '\u2212'];

  $('table.infobox tbody tr').each((i, e) => {
    const txt = $(e, 'td').text().trim();
    if (/^Spectral type/.test(txt)) {
      star.type = txt.substr(13).trim();
    } else if (/^Mass/.test(txt)) {
      star.mass = txt.substr(4).slice(0, -3).trim();
    } else if (/^Radius/.test(txt)) {
      star.radius = txt.substr(6).slice(0, -3);
    } else if(/^Temperature/.test(txt)) {
      star.temp = txt.substr(11).slice(0, -2);
    }
  });

  if (!star.type)
    return;
  if (star.type.substr(0, 1) !== 'G')
    return;

  for (let e in star) {
    if (e === 'name')
      continue;

    replace_vals.forEach((i) => {
      if (star[e].includes(i))
        star[e] = star[e].substr(0, star[e].indexOf(i)).trim();
    });

    star[e] = star[e].replace(/(~|,| |\u{00a0})/gu, '');

    if (!isNaN(star[e]))
      star[e] = +star[e];
  }

  if (star.type.length < 2) {
    return;
  }
  if (!star.type ||
      typeof star.mass !== 'number' ||
      typeof star.radius !== 'number' ||
      typeof star.temp !== 'number') {
    return;
  }

  console.log(JSON.stringify(star));
  //const th = $('table.infobox tbody tr th').text().split('\n');
  //const td = $('table.infobox tbody tr td').text().split('\n');
  //for (let i = 0; i < th.length; i++) {
    //console.log(th[i+2], ':', td[i]);
  //}
}
