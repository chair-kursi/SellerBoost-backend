"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

validateSku = function validateSku(skuObj) {
  var validateSkuCode = function validateSkuCode(code) {
    if (!code) return "Invalid StyleCode, StyleCode cannot be EMPTY.";
    if (code.length > 20 || code.length < 3) return "Invalid SizeCode, try again!!";

    for (var _i = 0; _i < code.length; _i++) {
      var c = code.charCodeAt(_i);

      if (!(c > 47 && c < 58) && !(c > 64 && c < 91) && code[_i] !== '-' && code[_i] !== ' ' && code[_i] !== ':') {
        return "Invalid SizeCode, try again!!";
      }
    }

    return "";
  };

  var validateStyleCode = function validateStyleCode(code) {
    if (!code) return "Invalid StyleCode, StyleCode cannot be EMPTY.";
    if (code.length > 20 || code.length < 3) return "Invalid StyleCode, try again!!";

    for (var _i2 = 0; _i2 < code.length; _i2++) {
      var c = code.charCodeAt(_i2);

      if (!(c > 47 && c < 58) && !(c > 64 && c < 91) && code[_i2] !== '-' && code[_i2] !== ' ' && code[_i2] !== ':') {
        return "Invalid StyleCode, try again!!";
      }
    }

    return "";
  };

  var validateSizeCode = function validateSizeCode(code) {
    if (!code) return "Invalid SizeCode, it can't be EMPTY!!";
    if (code.length > 20 || code.length < 3) return "Invalid SizeCode, try again!!";

    for (var _i3 = 0; _i3 < code.length; _i3++) {
      var c = code.charCodeAt(_i3);

      if (!(c > 47 && c < 58) && !(c > 64 && c < 91) && code[_i3] !== '-' && code[_i3] !== ' ' && code[_i3] !== ':') {
        return "Invalid SizeCode, try again!!";
      }
    }

    return "";
  };

  var locator = [];
  var skuCodeErr = validateSkuCode(skuObj.skuCode);
  var styleCodeErr = validateStyleCode(skuObj.styleCode);
  var sizeCodeErr = validateSizeCode(skuObj.sizeCode);
  if (skuObj.skuCode && skuCodeErr.length) locator = [].concat(_toConsumableArray(locator), [{
    id: "skuCode",
    message: skuCodeErr
  }]);
  if (skuObj.styleCode && styleCodeErr.length) locator = [].concat(_toConsumableArray(locator), [{
    id: "styleCode",
    message: styleCodeErr
  }]);
  if (skuObj.sizeCode && sizeCodeErr.length) locator = [].concat(_toConsumableArray(locator), [{
    id: "sizeCode",
    message: sizeCodeErr
  }]);
  var response = {};

  if (locator.length) {
    var timeStamp = new Date().toString();
    var errorCode = "";

    for (var i = 0; i < locator.length; i++) {
      errorCode += locator[i].message + ", ";
    }

    response = {
      data: {},
      error: {
        errorCode: errorCode,
        httpStatus: 400,
        locator: locator,
        internalMessage: "Handler dispatch failed; nested exception is java.lang.Error: Unresolved compilation problem: \n\tSyntax error, insert \";\" to complete ReturnStatement\n",
        timeStamp: timeStamp
      }
    };
  }

  return response;
};

module.exports = {
  validateSku: validateSku
};