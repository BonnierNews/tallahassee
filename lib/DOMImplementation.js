const documentSymbol = Symbol.for("document");
const cookieJarSymbol = Symbol.for("cookieJar");

export default class DOMImplementation {
  constructor(document) {
    this[documentSymbol] = document;
  }
  createHTMLDocument(title) {
    const ownerDocument = this[documentSymbol];
    const Document = ownerDocument.constructor;
    return new Document(
      { text: `<!doctype html><html><head><title>${title}</title></head><body></body></html>` },
      ownerDocument[cookieJarSymbol]
    );
  }
}
