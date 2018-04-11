"use strict";

module.exports = function (name, data) {
  const retVal = {
    type: name
  };

  if (data) {
    retVal.detail = data.detail;
  }

  retVal.initCustomEvent = (type, canBubble, cancelable, detail) => {
    retVal.type = type;
    retVal.detail = detail.detail;
  };

  return retVal;
};
