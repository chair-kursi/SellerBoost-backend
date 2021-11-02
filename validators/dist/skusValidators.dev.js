"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _require = require("./basicValidations"),
    isValidSkuCode = _require.isValidSkuCode,
    isValidStyleCode = _require.isValidStyleCode,
    isValidSizeCode = _require.isValidSizeCode;

validateSku = function validateSku(skuObj) {
  // const validateSkuCode = (code) => {
  //     if (!code)
  //         return "Invalid SKU code, SKU code cannot be EMPTY.";
  //     if (code.length > 20 || code.length < 3)
  //         return "Invalid SizeCode, try again!!";
  //     for (let i = 0; i < code.length; i++) {
  //         var c = code.charCodeAt(i);
  //         if (!(c > 47 && c < 58) &&
  //             !(c > 64 && c < 91) &&
  //             code[i] !== '-' &&
  //             code[i] !== ' ' &&
  //             code[i] !== ':') {
  //             return "Invalid SKU code, try again!!";
  //         }
  //     }
  //     return "";
  // }
  // const validateStyleCode = (code) => {
  //     if (!code)
  //         return "Invalid Style Code, Style Code cannot be EMPTY.";
  //     if (code.length > 20 || code.length < 3)
  //         return "Invalid StyleCode, try again!!";
  //     for (let i = 0; i < code.length; i++) {
  //         var c = code.charCodeAt(i);
  //         if (!(c > 47 && c < 58) &&
  //             !(c > 64 && c < 91) &&
  //             code[i] !== '-' &&
  //             code[i] !== ' ' &&
  //             code[i] !== ':') {
  //             return "Invalid Style Code, try again!!";
  //         }
  //     }
  //     return "";
  // }
  // const validateSizeCode = (code) => {
  //     if (!code)
  //         return "Invalid Size Code, it can't be EMPTY!!";
  //     if (code.length > 20 || code.length < 3)
  //         return "Invalid Size Code, try again!!";
  //     for (let i = 0; i < code.length; i++) {
  //         var c = code.charCodeAt(i);
  //         if (!(c > 47 && c < 58) &&
  //             !(c > 64 && c < 91) &&
  //             code[i] !== '-' &&
  //             code[i] !== ' ' &&
  //             code[i] !== ':') {
  //             return "Invalid Size Code, try again!!";
  //         }
  //     }
  //     return "";
  // }
  var locator = [];
  var skuCodeErr = isValidSkuCode(skuObj.skuCode);
  var styleCodeErr = isValidStyleCode(skuObj.styleCode);
  var sizeCodeErr = isValidSizeCode(skuObj.sizeCode);
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