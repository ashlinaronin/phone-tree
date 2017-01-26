// todo: rewrite using map

const zodiac = ['', 'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn'];
const last_day = ['', 19, 18, 20, 20, 21, 21, 22, 22, 21, 22, 21, 20, 19];

function calculateSign(month, day) {
  // from http://coursesweb.net/javascript/zodiac-signs_cs
  return (day > last_day[month]) ? zodiac[month*1 + 1] : zodiac[month];
}

function getSign(birthday) {
    if (birthday.length < 4) return null;

    let month = parseInt(birthday.substr(0,2));
    let day = parseInt(birthday.substr(2,4));

    return calculateSign(month, day);
}

module.exports = {
    getSign
};