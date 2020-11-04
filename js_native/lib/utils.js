'use strict';

module.exports = {
  sec_to_string,
};

// Return seconds in an HH:MM:SS format
function sec_to_string(s) {
  let sec = 0;
  let min = 0;
  let hour = 0;
  let day = 0;
  let outs = '';

  s = floor(s);

  if (s === 0)
    return '00:00:00';
  outs = `${pad1(s % 60)}`;
  s = floor(s / 60);
  outs = s > 0 ? `${pad1(s % 60)}:${outs}` : `00:${outs}`;
  s = floor(s / 60);
  outs = s > 0 ? `${pad1(s % 24)}:${outs}` : `00:${outs}`;
  s = floor(s / 24);
  return s > 0 ? `${s}:${outs}` : outs;
}
