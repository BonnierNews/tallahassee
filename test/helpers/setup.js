"use strict";

process.env.TZ = "Europe/Stockholm";
process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

chai.config.truncateThreshold = 0;
chai.config.includeStack = true;

global.expect = chai.expect;
