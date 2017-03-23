const _ = require('lodash');

// For testing purposes, lets set the timezone so
// that it doesn't have different results on codeship
process.env.TZ = 'America/Edmonton'

// Suppress logging messages
process.env.LOG_LEVEL = 'error'

const lambda = require('../index');
const original = Object.assign({}, lambda);

lambda.stub = function(key, fn) {
    _.set(this, key, fn.bind(this));
};

lambda.unstub = function(key) {
    if(key) _.set(this, key, original[key].bind(this));
    else Object.assign(this, original);
};

module.exports = lambda;
