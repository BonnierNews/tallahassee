"use strict";

const chai = require("chai");

chai.config.includeStack = true;

const nock = require("nock");
nock.enableNetConnect("127.0.0.1");

global.expect = chai.expect;

