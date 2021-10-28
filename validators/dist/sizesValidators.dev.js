"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getSizeEntity = function getSizeEntity(req) {
  var entity = {};
  if (req.body.sizeCode) entity = _objectSpread({}, entity, {
    sizeCode: req.body.sizeCode
  });else if (req.params.sizeCode) entity = _objectSpread({}, entity, {
    sizeCode: req.params.sizeCode
  }); //ASK: What if the styleCode is neither in req.params.styleCode nor in req.body.styleCode??

  entity = _objectSpread({}, entity, {
    name: req.body.name
  });
  return entity;
};

validateSize = function validateSize(sizeObj) {
  // const sizeEntity = getSizeEntity(req);
  var validateSizeCode = function validateSizeCode(code) {
    if (!code) return "Invalid SizeCode, it can't be EMPTY!!";
    if (code.length > 20 || code.length < 3) return "Invalid SizeCode, try again!!";

    for (var _i = 0; _i < code.length; _i++) {
      var c = code.charCodeAt(_i);

      if (!(c > 47 && c < 58) && !(c > 64 && c < 91) && code[_i] !== '-' && code[_i] !== ' ' && code[_i] !== ':') {
        return "Invalid SizeCode, try again!!";
      }
    }

    return "";
  };

  var validateName = function validateName(name) {
    if (!name) return "Invalid Name, it can't be EMPTY!!";
    if (name.length > 50 || name.length < 3) return "Invalid name, try again!!";

    for (var _i2 = 0; _i2 < name.length; _i2++) {
      var c = name.charCodeAt(_i2);
      var s = name[_i2];

      if (!(c > 47 && c < 58) && !(c > 64 && c < 91) && !(c > 96 && c < 123) && // lower alpha (a-z) ) { 
      s !== ' ' && s !== ':' && s !== '-' && s !== '_' && s !== '.' && s !== ']' && s !== '[' && s !== '}' && s !== '{' && s !== ')' && s !== '(') {
        return "Invalid name, try again!!";
      }
    }

    return "";
  };

  var locator = [];
  var sizeCodeErr = validateSizeCode(sizeObj.sizeCode); // const nameErr = validateName(sizeEntity.name);

  if (sizeCodeErr.length) locator = [].concat(_toConsumableArray(locator), [{
    id: "sizeCode",
    message: sizeCodeErr
  }]); // if (nameErr.length)
  // 	locator = [...locator, {
  // 		id: "name",
  // 		message: nameErr
  // 	}];

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
        internalMessage: "Validation Error",
        timeStamp: timeStamp
      }
    };
  }

  return response;
};

module.exports = {
  validateSize: validateSize
};