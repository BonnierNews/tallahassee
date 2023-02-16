"use strict";

const ELEMENT_NODE = 1; // An Element node like <p> or <div>.
const ATTRIBUTE_NODE = 2; // An Attribute of an Element.
const TEXT_NODE = 3; // The actual Text inside an Element or Attr.
const CDATA_SECTION_NODE = 4; // A CDATASection, such as <!CDATA[[ … ]]>.
const PROCESSING_INSTRUCTION_NODE = 7; // A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
const COMMENT_NODE = 8; // A Comment node, such as <!-- … -->.
const DOCUMENT_NODE = 9; // A Document node.
const DOCUMENT_TYPE_NODE = 10; // A DocumentType node, such as <!DOCTYPE html>.
const DOCUMENT_FRAGMENT_NODE = 11; // A DocumentFragment node.

module.exports = {
  ELEMENT_NODE,
  ATTRIBUTE_NODE,
  TEXT_NODE,
  CDATA_SECTION_NODE,
  PROCESSING_INSTRUCTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE,
  DOCUMENT_FRAGMENT_NODE,
};
