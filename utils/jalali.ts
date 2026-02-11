/**
 * Jalaali JavaScript Library - Converted to TypeScript utils
 * Based on jalaali-js (https://github.com/jalaali/jalaali-js)
 */

interface JalaaliDate {
  jy: number;
  jm: number;
  jd: number;
}

interface GregorianDate {
  gy: number;
  gm: number;
  gd: number;
}

const breaks =  [ -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210
  , 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
  ];

const div = (a: number, b: number) => ~~(a / b);
const mod = (a: number, b: number) => a - ~~(a / b) * b;

export const toJalaali = (gy: number, gm: number, gd: number): JalaaliDate => {
  let bl = breaks.length
    , gy2 = gy - 1600
    , gd2 = gd - 1
    , id = 0
    , jp = 0
    , jm = 0
    , jd = 0
    , jump = 0
    , g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

  if (gy2 > 979) {
    id = gy2 - 979;
    gy2 -= 979;
  } else {
    id = gy2;
  }

  let h1 = 1461 * div(id, 33);
  let h2 = div(mod(id, 33) * 8, 33);
  let jd2 = 365 * id + h1 + h2;
  let jdm = 0;

  if (gm < 3) jd2 += 286;
  else jd2 -= 79;
  
  // Leap year calculation
  let leap = (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
  if (leap && gm > 2) jd2 += 1;

  jd2 += g_d_m[gm - 1] + gd2;

  jp = 0;
  for (let k = 0; k < bl; k += 1) {
    if (breaks[k] > jd2) {
      jump = breaks[k - 1];
      break;
    }
    jump = breaks[k];
  }

  if (jump > jd2) {
    // This part should not happen if breaks array is correct for the range
    // Defaulting logic could go here
  }

  jdm = jd2 - jump;
  
  let jy = div(jdm, 33) * 33 + div(mod(jdm, 33) * 4, 128) + 1403;
  // Adjust year based on break point offset in breaks array context
  // Simplified logic based on common algorithm:
  // The 'jump' lookup above is simplified. A strict implementation:
  
  // Re-implementing a more direct conversion for robustness:
  // Source: https://en.wikipedia.org/wiki/Jali_calendar#Conversion_algorithms
  // Using the 'jalaali-js' implementation logic directly:
  
  return toJalaaliDirect(gy, gm, gd);
};

// Precise implementation from jalaali-js
function toJalaaliDirect(gy: number, gm: number, gd: number): JalaaliDate {
  if (gy > 1600) {
    var jy = 979
    var gy2 = gy - 1600
  } else {
    var jy = 0
    var gy2 = gy - 621
  }
  var gy3 = (gm > 2) ? (gy2 + 1) : gy2
  var days = (365 * gy2) + div(gy3 + 3, 4) - div(gy3 + 99, 100) + div(gy3 + 399, 400) - 80 + gd + [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][gm - 1]
  var jy2 = jy + 33 * div(days, 12053)
  var days2 = mod(days, 12053)
  var jy3 = jy2 + 4 * div(days2, 1461)
  var days3 = mod(days2, 1461)

  if (days3 > 365) {
    var jy4 = jy3 + div(days3 - 1, 365)
    var days4 = mod(days3 - 1, 365)
  } else {
    var jy4 = jy3
    var days4 = days3
  }
  var jm: number;
  var jd: number;
  if (days4 < 186) {
    jm = 1 + div(days4, 31)
    jd = 1 + mod(days4, 31)
  } else {
    jm = 7 + div(days4 - 186, 30)
    jd = 1 + mod(days4 - 186, 30)
  }
  return { jy: jy4, jm: jm, jd: jd }
}

export const toGregorian = (jy: number, jm: number, jd: number): GregorianDate => {
  if (jy > 979) {
    var gy = 1600
    var jy2 = jy - 979
  } else {
    var gy = 621
    var jy2 = jy
  }

  var days = (365 * jy2) + (div(jy2, 33) * 8) + div(mod(jy2, 33) + 3, 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186)
  var gy2 = 400 * div(days, 146097)
  var days2 = mod(days, 146097)
  if (days2 > 36524) {
    var gy3 = gy2 + 100 * div(days2 - 1, 36524)
    var days3 = mod(days2 - 1, 36524)
  } else {
    var gy3 = gy2
    var days3 = days2
  }
  var gy4 = gy3 + 4 * div(days3, 1461)
  var days4 = mod(days3, 1461)
  if (days4 > 365) {
    var gy5 = gy4 + div(days4 - 1, 365)
    var days5 = mod(days4 - 1, 365)
  } else {
    var gy5 = gy4
    var days5 = days4
  }
  var gd = days5 + 1
  var gm: number;
  var sal_a = [0, 31, ((gy5 % 4 === 0 && gy5 % 100 !== 0) || (gy5 % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  for (gm = 0; gm < 13; gm++) {
    var v = sal_a[gm]
    if (gd <= v) break
    gd -= v
  }
  return { gy: gy + gy5, gm: gm, gd: gd }
}

export const formatJalali = (jy: number, jm: number, jd: number) => {
  return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
}

export const gregorianToJalaliString = (dateStr: string): string => {
  if (!dateStr) return '';
  const [gYear, gMonth, gDay] = dateStr.split('-').map(Number);
  const { jy, jm, jd } = toJalaali(gYear, gMonth, gDay);
  return formatJalali(jy, jm, jd);
}