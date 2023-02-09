import chai from "chai";
import nock from "nock";

process.env.TZ = "Europe/Stockholm";
process.env.NODE_ENV = "test";

chai.config.includeStack = true;

nock.enableNetConnect("127.0.0.1");

global.expect = chai.expect;

