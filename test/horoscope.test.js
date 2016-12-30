const assert = require('chai').assert;
const horoscope = require('../services/horoscope');

describe('horoscope', function() {
    describe('#getSign()', function() {
        it('should calculate Ashlin\'s sign correctly', function() {
            assert.equal('Capricorn', horoscope.getSign('0104'));
        });

        it('should calculate Andre\'s sign correctly', function () {
            assert.equal('Aquarius', horoscope.getSign('0126'));
        });

        it('should calculate Karen\'s sign correctly', function() {
            assert.equal('Virgo', horoscope.getSign('0902'));
        });

        it('should calculate Martha\'s sign correctly', function() {
            assert.equal('Virgo', horoscope.getSign('0901'));
        });

        it('should calculate Ira\'s sign correctly', function() {
            assert.equal('Virgo', horoscope.getSign('0828'));
        })
    });
});