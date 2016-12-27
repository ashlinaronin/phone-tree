const zodiac = ['', 'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn'];
const last_day = ['', 19, 18, 20, 20, 21, 21, 22, 22, 21, 22, 21, 20, 19];

function calculateSign(month, day) {
  // from http://coursesweb.net/javascript/zodiac-signs_cs
  return (day > last_day[month]) ? zodiac[month*1 + 1] : zodiac[month];
}

function getSign(birthday) {
    if (birthday.length < 4) return null;

    var month = birthday.substr(0,1);
    var day = birthday.substr(2,3);

    return calculateSign(month, day);
}

module.exports = {
    getSign: getSign
};
