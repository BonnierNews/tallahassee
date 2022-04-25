"use strict";

const Document = require("../lib/Document");
const FormData = require("../lib/FormData");

describe("FormData", () => {
  let form;
  beforeEach(() => {
    const document = new Document({
      text: `
        <html>
          <body>
            <form id="get-form" type="get" action="/">
              <input name="mycheck" type="checkbox" value="1">
              <input name="myinput" type="text" value="Foo">
              <button name="mysubmit" type="submit">Submit</submit>
            </form>
          </body>
        </html>`
    });

    form = document.getElementById("get-form");
  });

  it("can not get length of entries", () => {
    const data = new FormData(form);
    const entries = data.entries();
    expect(data).to.not.have.property("length");
    expect(entries).to.not.have.property("length");
  });

  it("can get entries", () => {
    const data = new FormData(form);
    const entries = data.entries();
    expect([...entries]).to.deep.equal([["mycheck", "1"], ["myinput", "Foo"], ["mysubmit", ""]]);
  });

  it("can get entries directly from instance", () => {
    const data = new FormData(form);
    expect(Object.fromEntries(data)).to.deep.equal({
      mycheck: "1",
      myinput: "Foo",
      mysubmit: ""
    });
  });
});
