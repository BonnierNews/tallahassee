"use strict";

const {Storage} = require("../lib");

describe("Storage", () => {
  let localStorage;
  beforeEach(() => {
    localStorage = new Storage();
  });

  it("should return empty storage", () => {
    expect(localStorage).to.eql({length: 0});
  });

  it("should return all values currently stored", () => {
    localStorage.setItem("test-item", "foo");

    expect(localStorage).to.eql({"test-item": "foo", length: 1});
  });

  it("should return null if no item is found", () => {
    const result = localStorage.getItem("test-item");

    expect(result).to.be.null;
  });

  it("should always set item as string", () => {
    localStorage.setItem("number", 1);
    localStorage.setItem("date", new Date(2018, 3, 18));
    localStorage.setItem("array", [1, 2]);
    localStorage.setItem("obj", {});
    localStorage.setItem("undef", undefined);
    localStorage.setItem("null", null);

    expect(localStorage.getItem("number")).to.eql("1");
    expect(localStorage.getItem("date")).to.equal(new Date(2018, 3, 18).toString());
    expect(localStorage.getItem("array")).to.equal("1,2");
    expect(localStorage.getItem("obj")).to.equal("[object Object]");
    expect(localStorage.getItem("undef")).to.equal("undefined");
    expect(localStorage.getItem("null")).to.equal("null");
  });

  it("should get value if set", () => {
    localStorage.setItem("test-item", "foo");

    const result = localStorage.getItem("test-item");
    expect(result).to.equal("foo");
  });

  it("should return length of items", () => {
    localStorage.setItem("test-item", "foo");

    const result = localStorage.length;
    expect(result).to.equal(1);
  });

  it("should return correct length even if setting it directly", () => {
    localStorage["test-item"] = "foo";

    const result = localStorage.length;
    expect(result).to.equal(1);
  });

  it("should remove item", () => {
    localStorage.removeItem("test-item");

    const result = localStorage.getItem("test-item");
    expect(result).to.be.null;
  });

  it("should return key by index", () => {
    localStorage.setItem("test-item-1", "foo");
    localStorage.setItem("test-item-2", "foo");
    localStorage.setItem("test-item-3", "foo");

    expect(localStorage.key(1)).to.equal("test-item-2");
  });

  it("should return null if key at index index doesn't exist", () => {
    expect(localStorage.key(1)).to.be.null;
  });

  it("should clear all", () => {
    localStorage.clear();

    expect(localStorage).to.eql({length: 0});
  });

  it("can be overwritten for testing purposes", () => {
    const mockStorage = {};
    localStorage = mockStorage;
    expect(localStorage === mockStorage).to.be.true;
  });
});
