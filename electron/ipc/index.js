const settings = require('./settings');
const terms = require('./terms');
const status = require('./status');

module.exports = (params) => {
    settings(params.settings, params.services);
    terms(params.settings);
    status(params.services);
};
