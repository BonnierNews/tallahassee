import { Document } from "../lib/index.js";

describe("HTMLSelectElement", () => {
  describe("single select", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <label for="pet-select">Choose a pet:</label>

              <select name="pets" id="pet-select">
                  <option value="">--Please choose an option--</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="hamster">Hamster</option>
                  <option value="parrot">Parrot</option>
                  <option value="spider">Spider</option>
                  <option value="goldfish">Goldfish</option>
              </select>
            </body>
          </html>`,
      });
    });

    it("has options", () => {
      const elm = document.getElementById("pet-select");
      expect(elm.options.length).to.equal(7);
    });

    it("options can be for iterated", () => {
      const elm = document.getElementById("pet-select");
      const values = [];
      for (const o of elm.options) {
        values.push(o.value);
      }
      expect(values).to.deep.equal([
        "",
        "dog",
        "cat",
        "hamster",
        "parrot",
        "spider",
        "goldfish",
      ]);
    });

    it("options can be for let iterated", () => {
      const elm = document.getElementById("pet-select");
      const values = [];
      const options = elm.options;
      for (let i = 0; i < options.length; i++) {
        values.push(options[i].value);
      }

      expect(values).to.deep.equal([
        "",
        "dog",
        "cat",
        "hamster",
        "parrot",
        "spider",
        "goldfish",
      ]);
    });

    it("options keys can be iterated", () => {
      const elm = document.getElementById("pet-select");
      const values = [];
      for (const i in elm.options) {
        values.push(i);
      }
      expect(values).to.deep.equal([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "length",
        "selectedIndex",
      ]);
    });

    it("add option updates options list", () => {
      const elm = document.getElementById("pet-select");
      elm.insertAdjacentHTML("beforeend", "<option value='snake'>Snake</option>");
      expect(elm.options.length).to.equal(8);
    });

    it("remove option updates options list", () => {
      const elm = document.getElementById("pet-select");
      elm.firstElementChild.remove();
      expect(elm.options.length).to.equal(6);
    });

    it("starts with first option as value", () => {
      const elm = document.getElementById("pet-select");
      expect(elm.selectedIndex).to.equal(0);
      expect(elm.value).to.equal("");
    });

    it("set value sets selected index", () => {
      const elm = document.getElementById("pet-select");
      elm.value = "parrot";
      expect(elm.selectedOptions.length).to.equal(0);
    });

    it("set selected index sets value", () => {
      const elm = document.getElementById("pet-select");
      elm.selectedIndex = 5;
      expect(elm.value).to.equal("spider");
    });

    it("selected option is unselected if selected is unset", () => {
      const doc = new Document({
        text: `
          <html>
            <body>
              <select name="pets" id="pet-select">
                  <option value="dog">Dog</option>
                  <option selected value="cat">Cat</option>
              </select>
            </body>
          </html>`,
      });
      const elm = doc.getElementById("pet-select");
      elm.options[1].selected = false;
      expect(elm.options[1].selected).to.be.false;
      expect(elm.selectedOptions.length).to.equal(0);
    });
  });

  describe("multiple select", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <select name="pets" id="pet-select" multiple>
                  <option value="">--Please choose an option--</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="hamster">Hamster</option>
                  <option value="parrot">Parrot</option>
                  <option value="spider">Spider</option>
                  <option value="goldfish">Goldfish</option>
              </select>
            </body>
          </html>`,
      });
    });

    it("starts with selected index -1 and empty value", () => {
      const elm = document.getElementById("pet-select");
      expect(elm.selectedIndex).to.equal(-1);
      expect(elm.value).to.equal("");
    });

    it("set value sets selected index", () => {
      const elm = document.getElementById("pet-select");
      elm.value = "parrot";
      expect(elm.selectedIndex).to.equal(4);
    });

    it("set selected index sets value", () => {
      const elm = document.getElementById("pet-select");
      elm.selectedIndex = 5;
      expect(elm.value).to.equal("spider");
    });
  });

  describe("multiple select with selected options", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <select name="pets" id="pet-select" multiple>
                  <option value="">--Please choose an option--</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="hamster">Hamster</option>
                  <option value="parrot">Parrot</option>
                  <option value="spider">Spider</option>
                  <option value="goldfish">Goldfish</option>
              </select>
            </body>
          </html>`,
      });
    });

    it("starts with selected index -1 and empty value", () => {
      const elm = document.getElementById("pet-select");
      expect(elm.selectedIndex).to.equal(-1);
      expect(elm.value).to.equal("");
    });

    it("set value sets selected index", () => {
      const elm = document.getElementById("pet-select");
      elm.value = "parrot";
      expect(elm.selectedIndex).to.equal(4);
    });

    it("set selected index sets value", () => {
      const elm = document.getElementById("pet-select");
      elm.selectedIndex = 5;
      expect(elm.value).to.equal("spider");
    });
  });

  describe("empty select", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <select name="pets" id="pet-select">
              </select>
            </body>
          </html>`,
      });
    });

    it("selected index is -1", () => {
      const elm = document.getElementById("pet-select");
      expect(elm.selectedIndex).to.equal(-1);
    });
  });

  describe("select", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <select>
                <option value="1">value of 1</option>
                <option value="2" selected="selected">value of 2</option>
                <option>value of 3</option>
              </select>
              <select multiple="multiple">
                <option value="1">value of 1</option>
                <option selected value="2">value of 2</option>
                <option value="3">value of 3</option>
              </select>
            </body>
          </html>`,
      });
    });

    it("multiple is set", () => {
      const [ select, multiple ] = document.getElementsByTagName("select");
      expect(select.multiple).to.be.false;
      expect(multiple.multiple).to.be.true;
    });

    it("set multiple alters select element", () => {
      const [ select, multiple ] = document.getElementsByTagName("select");
      select.multiple = true;
      expect(select.multiple).to.be.true;

      multiple.multiple = 0;
      expect(multiple.multiple).to.be.false;
    });

    it("returns options in select", () => {
      const [ select ] = document.getElementsByTagName("select");
      const options = select.getElementsByTagName("option");

      expect(select.options.length).to.equal(3);
      expect(select.options[0] === options[0]).to.equal(true);
      expect(select.options[1] === options[1]).to.equal(true);
      expect(select.options[2] === options[2]).to.equal(true);
    });

    it("returns selected index of options in select", () => {
      const [ select ] = document.getElementsByTagName("select");
      expect(select.selectedIndex).to.equal(1);
    });

    it("gets value from selected option", () => {
      const select = document.getElementsByTagName("select")[0];
      expect(select).to.have.property("value", "2");
      select.options[0].selected = true;
      expect(select).to.have.property("value", "1");
    });

    it("returns empty value if selected option has no value", () => {
      const select = document.getElementsByTagName("select")[0];
      expect(select.options[2].value).to.equal("");
    });

    it("should return the innerText of option if missing value", () => {
      const select = document.getElementsByTagName("select")[0];
      select.options[2].selected = true;
      expect(select).to.have.property("value", "value of 3");
    });

    it("should change selected index when changing selected option", () => {
      const [ select ] = document.getElementsByTagName("select");

      select.options[0].selected = true;

      expect(select.selectedIndex).to.equal(0);
      expect(select.options[0].selected).to.be.true;
      expect(select.options[1].selected).to.be.false;
    });

    it("should not de-select other options when selecting in multiple select", () => {
      const [ , select ] = document.getElementsByTagName("select");

      select.options[0].selected = true;

      expect(select.options[0].selected).to.be.true;
      expect(select.options[1].selected).to.be.true;
    });

    it("should return selected option in selectedOptions", () => {
      const [ select ] = document.getElementsByTagName("select");
      select.options[1].selected = true;
      select.options[2].selected = true;
      expect(select.selectedIndex).to.equal(2);
      expect(select.selectedOptions).to.have.length(1);
      expect(select.selectedOptions[0] === select.options[2]).to.be.true;
    });

    it("muliple should return selected options in selectedOptions", () => {
      const [ , select ] = document.getElementsByTagName("select");

      select.options[1].selected = true;
      select.options[2].selected = true;

      expect(select.selectedOptions.length).to.equal(2);
      expect(select.selectedOptions[0] === select.options[1]).to.be.true;
      expect(select.selectedOptions[1] === select.options[2]).to.be.true;
    });

    it("should emit change on select when changing selected option", (done) => {
      const [ select ] = document.getElementsByTagName("select");

      select.addEventListener("change", () => done());

      select.options[0].selected = true;
    });
  });

  describe("required", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <form id="get-form" type="get" action="/">
                <label for="pet-select">Choose a pet:</label>
                <select name="pets" id="pet-select" required>
                    <option></option>
                    <option value="dog">Dog</option>
                    <option>No value</option>
                </select>
                <input id="submit-form" type="submit">
              </form>
            </body>
          </html>`,
      });
    });

    it("reports valueMissing when empty value has been selected", () => {
      const elm = document.getElementById("pet-select");
      expect(elm).to.have.property("validity");
      const validity = elm.validity;

      expect(validity).to.have.property("valueMissing", true);
      expect(elm.checkValidity()).to.equal(false);
    });

    it("does not report valueMissing when value has been selected", () => {
      const elm = document.getElementById("pet-select");
      elm.getElementsByTagName("option")[1].selected = true;
      expect(elm).to.have.property("validity");
      const validity = elm.validity;

      expect(validity).to.have.property("valueMissing", false);
      expect(elm.checkValidity()).to.equal(true);
    });

    it("does not report valueMissing when first value has text but no value attribute", () => {
      const elm = document.getElementById("pet-select");
      const firstOption = elm.getElementsByTagName("option")[0];
      firstOption.innerText = "Text";
      expect(elm).to.have.property("validity");
      const validity = elm.validity;

      expect(validity).to.have.property("valueMissing", false);
      expect(elm.checkValidity()).to.equal(true);
    });

    it("form submit is prevented if input is required", () => {
      let submitted = false;
      document.addEventListener("submit", () => (submitted = true));

      document.getElementById("submit-form").click();

      expect(submitted).to.be.false;
    });
  });

  describe("custom validity", () => {
    let document;
    beforeEach(() => {
      document = new Document({
        text: `
          <html>
            <body>
              <form id="get-form" type="get" action="/">
                <label for="pet-select">Choose a pet:</label>
                <select name="pets" id="pet-select" required oninvalid="setCustomValidity('Required')">
                    <option value=""></option>
                    <option value="dog">Dog</option>
                </select>
                <input id="submit-form" type="submit">
              </form>
            </body>
          </html>`,
      });
    });

    it("setCustomValidity() without argument throws TypeError", () => {
      const form = document.forms[0];
      expect(() => form.elements.pets.setCustomValidity()).to.throw(TypeError, "Failed to execute 'setCustomValidity' on 'HTMLSelectElement': 1 argument required, but only 0 present.");
    });

    it("shows custom error message", () => {
      const form = document.forms[0];
      document.getElementById("submit-form").click();

      expect(form.elements.pets.validationMessage).to.equal("Required");
      expect(form.elements.pets.validity).to.have.property("customError", true);
    });

    it("checkValidity() returns true if required select is disabled", () => {
      const form = document.forms[0];
      form.elements.pets.disabled = true;
      expect(form.elements.pets.checkValidity()).to.equal(true);
    });

    it("disabled required input is ignored", () => {
      const form = document.forms[0];

      let submitted = false;
      document.addEventListener("submit", () => (submitted = true));

      form.elements.pets.disabled = true;
      document.getElementById("submit-form").click();
      expect(submitted).to.be.true;

      expect(form.elements.pets.validationMessage).to.equal("");
    });
  });
});
