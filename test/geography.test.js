const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

const geography = require('../services/geography');

describe('geography', function() {
    describe('#getLocality()', function() {

        it('should determine Portland localities correctly', function() {
            return Promise.all([
                geography.getLocality(97212).should.eventually.equal('Portland'),
                geography.getLocality(97205).should.eventually.equal('Portland'),
                geography.getLocality(97214).should.eventually.equal('Portland')
            ]);
        });

        it('should determine Eugene localities correctly', function() {
            return Promise.all([
                geography.getLocality(97405).should.eventually.equal('Eugene'),
                geography.getLocality(97401).should.eventually.equal('Eugene'),
                geography.getLocality(97402).should.eventually.equal('Eugene')
            ]);
        });

    });
});