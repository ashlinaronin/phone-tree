let cfg = {};

// HTTP Port to run our web application
cfg.port = process.env.PORT || 2000;

cfg.mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/';

cfg.baseUrl = process.env.BASE_URL || '';

// Export configuration object
module.exports = cfg;