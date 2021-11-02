"use strict";

isValidSkuCode = function isValidSkuCode(code) {
  if (!code) return "Invalid SKU code, SKU code cannot be EMPTY.";
  if (code.length > 20 || code.length < 3) return "Invalid SizeCode, try again!!";

  for (var i = 0; i < code.length; i++) {
    var c = code.charCodeAt(i);

    if (!(c > 47 && c < 58) && !(c > 64 && c < 91) && code[i] !== '-' && code[i] !== ' ' && code[i] !== ':') {
      return "Invalid SKU code, try again!!";
    }
  }

  return "";
};

isValidStyleCode = function isValidStyleCode(code) {
  if (!code) return "Invalid Style Code, Style Code cannot be EMPTY.";
  if (code.length > 20 || code.length < 3) return "Invalid StyleCode, try again!!";

  for (var i = 0; i < code.length; i++) {
    var c = code.charCodeAt(i);

    if (!(c > 47 && c < 58) && !(c > 64 && c < 91) && code[i] !== '-' && code[i] !== ' ' && code[i] !== ':') {
      return "Invalid Style Code, try again!!";
    }
  }

  return "";
};

isValidSizeCode = function isValidSizeCode(code) {
  if (!code) return "Invalid Size Code, it can't be EMPTY!!";
  if (code.length > 20 || code.length < 3) return "Invalid Size Code, try again!!";

  for (var i = 0; i < code.length; i++) {
    var c = code.charCodeAt(i);

    if (!(c > 47 && c < 58) && !(c > 64 && c < 91) && code[i] !== '-' && code[i] !== ' ' && code[i] !== ':') {
      return "Invalid Size Code, try again!!";
    }
  }

  return "";
};

module.exports = {
  isValidSizeCode: isValidSizeCode,
  isValidSkuCode: isValidSkuCode,
  isValidStyleCode: isValidStyleCode
};