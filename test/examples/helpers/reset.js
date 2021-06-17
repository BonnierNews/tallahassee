'use strict';

const nock = require('nock');

module.exports = function reset () {
	nock.cleanAll();
};
