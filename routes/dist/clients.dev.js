"use strict";

var express = require('express');

var router = express.Router();

var Client = require('../models/Client');

var createClientObj = function createClientObj(clientId, name, email, mobile, emailVerified, mobileVerified, password) {
  obj = {
    clientId: clientId,
    name: name,
    email: email,
    mobile: mobile,
    emailVerified: emailVerified,
    mobileVerified: mobileVerified,
    password: password
  };
  return obj;
};

router.post("/clientId", function _callee(req, res) {
  var _obj, localId, client, savedClient;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _obj = {}, localId = req.cookies.LocalId;
          if (localId === "RvvwQ2XVc7hPHCDIfTDO8qnb4c83") _obj = createClientObj("StyloBug", "Stylo Bug", "abc@123.com", 8474837412, false, false, "RvvwQ2XVc7hPHCDIfTDO8qnb4c83");
          if (localId === "6N9yuxkxf6MhmSdOZuvAuze3l943") _obj = createClientObj("Yuvdhi", "Yuvdhi", "satpal@yuvdhi.com", 8474837422, false, false, "6N9yuxkxf6MhmSdOZuvAuze3l943");
          console.log("/clientId: " + localId);
          client = new Client(_obj);
          _context.next = 8;
          return regeneratorRuntime.awrap(client.save());

        case 8:
          savedClient = _context.sent;
          res.json(savedClient);
          _context.next = 16;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](0);
          console.log("/clientId error " + _context.t0);
          res.status(400).json({
            message: _context.t0
          });

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 12]]);
});
router.get("/clientId", function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          try {
            // console.log(req.cookies); 
            res.json({
              cookies: req.cookies.LocalId || "no cookies"
            });
          } catch (err) {
            if (err) res.status(400).json({
              message: err
            });
            res.json({
              message: err
            });
          }

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
});
module.exports = router;