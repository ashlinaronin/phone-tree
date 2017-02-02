let cfg = {};

// HTTP Port to run our web application
cfg.port = process.env.PORT || 2000;

cfg.mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/';

cfg.baseUrl = process.env.BASE_URL || '';

cfg.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
cfg.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
cfg.TWILIO_FROM_PHONE = process.env.TWILIO_FROM_PHONE;

cfg.FRONTEND_PRODUCT_URL = process.env.FRONTEND_PRODUCT_URL || 'https://nectar.shop/product';

// Export configuration object
module.exports = cfg;