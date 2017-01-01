const cointreau = require('./agents/cointreau');
const jenavieve = require('./agents/jenavieve');
const ricardo = require('./agents/ricardo');

let agents = require('express').Router();

agents.use('/cointreau', cointreau);
agents.use('/jenavieve', jenavieve);
agents.use('/ricardo', ricardo);

module.exports = agents;