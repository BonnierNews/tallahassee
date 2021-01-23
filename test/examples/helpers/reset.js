import nock from "nock";

export default function reset () {
  nock.cleanAll();
}
