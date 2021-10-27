"use strict";

module.exports = {
  ELEMENT_NODE: 1, //	An Element node like <p> or <div>.
  ATTRIBUTE_NODE: 2, //	An Attribute of an Element.
  TEXT_NODE: 3, //	The actual Text inside an Element or Attr.
  CDATA_SECTION_NODE: 4, //	A CDATASection, such as <!CDATA[[ … ]]>.
  PROCESSING_INSTRUCTION_NODE: 7, //	A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
  COMMENT_NODE: 8, //	A Comment node, such as <!-- … -->.
  DOCUMENT_NODE: 9, //	A Document node.
  DOCUMENT_TYPE_NODE: 10, //	A DocumentType node, such as <!DOCTYPE html>.
  DOCUMENT_FRAGMENT_NODE: 11, //	A DocumentFragment node.
};
