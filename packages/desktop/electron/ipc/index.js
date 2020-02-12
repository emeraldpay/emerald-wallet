const settings = require('./settings');
const terms = require('./terms');

module.exports = (params) => {
  settings(params.settings);
  terms(params.settings);
};
