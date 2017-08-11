const settings = require('./settings');
const terms = require('./terms');
const status = require('./status');

module.exports = function (params) {
    settings(params.settings, params.services);
    terms(params.settings);
    status(params.services);
};
