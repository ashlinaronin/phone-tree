const cointreau = require('./agents/cointreau');
const jenavieve = require('./agents/jenavieve');
const ricardo = require('./agents/ricardo');
const ada = require('./agents/ada');

let agents = require('express').Router();

agents.use('/cointreau', cointreau);
agents.use('/jenavieve', jenavieve);
agents.use('/ricardo', ricardo);
agents.use('/ada', ada);

module.exports = agents;