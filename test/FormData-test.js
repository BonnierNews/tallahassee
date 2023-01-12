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

  it("can get input entries", () => {
    const entries = new FormData(form).entries();
    expect([...entries]).to.deep.equal([["myinput", "Foo"]]);
  });

  it("includes checked checkbox entry", () => {
    form.elements.mycheck.checked = true;
    const entries = new FormData(form).entries();
    expect([...entries]).to.deep.equal([["mycheck", "1"], ["myinput", "Foo"]]);
  });

  it("can be converted into object directly from instance", () => {
    form.elements.mycheck.checked = true;
    const data = new FormData(form);
    expect(Object.fromEntries(data)).to.deep.equal({
      mycheck: "1",
      myinput: "Foo",
    });
  });

  it("returns empty strings if values are nulled", () => {
    const data = new FormData(form);
    form.elements.mycheck.checked = true;
    form.elements.mycheck.value = null;
    form.elements.myinput.value = null;
    expect(Object.fromEntries(data)).to.deep.equal({
      mycheck: "on",
      myinput: "",
    });
  });

  it("ignores fields without name", () => {
    const data = new FormData(form);
    form.elements.mycheck.checked = true;
    form.elements[1].name = "";
    expect(Object.fromEntries(data)).to.deep.equal({
      mycheck: "1",
    });
  });

  it("ignores fields that are disabled", () => {
    const data = new FormData(form);
    form.elements.mycheck.checked = true;
    form.elements.mycheck.disabled = true;
    expect(Object.fromEntries(data)).to.deep.equal({
      myinput: "Foo",
    });
  });

  it("throws type error if constructing with element that is not a form", () => {
    expect(() => {
      new FormData(form.elements[0]);
    }).to.throw(TypeError, "Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'");
  });

  it("accepts no argument", () => {
    const data = new FormData();
    expect(Object.fromEntries(data)).to.deep.equal({});
  });
});
