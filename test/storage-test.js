"use strict";

const {Storage, Window} = require("../lib");

describe("Storage", () => {
  let window;

  beforeEach(() => {
    window = Window({});
    window.localStorage = new Storage();
  });

  it("should return empty storage", () => {
    expect(window.localStorage).to.eql({length: 0});
  });

  it("should return all values currently stored", () => {
    window.localStorage.setItem("test-item", "foo");

    expect(window.localStorage).to.eql({"test-item": "foo", length: 1});
  });

  it("should return null if no item is found", () => {
    const result = window.localStorage.getItem("test-item");

    expect(result).to.be.null;
  });

  it("should always set item as string", () => {
    window.localStorage.setItem("number", 1);
    window.localStorage.setItem("date", new Date(2018, 3, 18));
    window.localStorage.setItem("array", [1, 2]);
    window.localStorage.setItem("obj", {});
    window.localStorage.setItem("undef", undefined);
    window.localStorage.setItem("null", null);

    expect(window.localStorage.getItem("number")).to.eql("1");
    expect(window.localStorage.getItem("date")).to.equal(new Date(2018, 3, 18).toString());
    expect(window.localStorage.getItem("array")).to.equal("1,2");
    expect(window.localStorage.getItem("obj")).to.equal("[object Object]");
    expect(window.localStorage.getItem("undef")).to.equal("undefined");
    expect(window.localStorage.getItem("null")).to.equal("null");
  });

  it("should get value if set", () => {
    window.localStorage.setItem("test-item", "foo");

    const result = window.localStorage.getItem("test-item");
    expect(result).to.equal("foo");
  });

  it("should return length of items", () => {
    window.localStorage.setItem("test-item", "foo");

    const result = window.localStorage.length;
    expect(result).to.equal(1);
  });

  it("should return correct length even if setting it directly", () => {
    window.localStorage["test-item"] = "foo";

    const result = window.localStorage.length;
    expect(result).to.equal(1);
  });

  it("should remove item", () => {
    window.localStorage.removeItem("test-item");

    const result = window.localStorage.getItem("test-item");
    expect(result).to.be.null;
  });

  it("should return key by index", () => {
    window.localStorage.setItem("test-item-1", "foo");
    window.localStorage.setItem("test-item-2", "foo");
    window.localStorage.setItem("test-item-3", "foo");

    expect(window.localStorage.key(1)).to.equal("test-item-2");
  });

  it("should return null if key at index index doesn't exist", () => {
    expect(window.localStorage.key(1)).to.be.null;
  });

  it("should clear all", () => {
    window.localStorage.clear();

    expect(window.localStorage).to.eql({length: 0});
  });

  it("can be deleted for testing purposes", () => {
    delete window.localStorage;
    expect(window.localStorage).to.be.undefined;
  });

  it("can be overwritten for testing purposes", () => {
    const mockStorage = {};
    window.localStorage = mockStorage;
    expect(window.localStorage === mockStorage).to.be.true;
  });

  it("is enumerable", () => {
    expect(Object.keys(window)).to.include("localStorage");
  });
});
