const settings = require('./settings');
const terms = require('./terms');
const status = require('./status');
const getPrivateKey = require('./privateKey');

module.exports = (params) => {
  settings(params.settings);
  terms(params.settings);
  status();
  getPrivateKey();
};
