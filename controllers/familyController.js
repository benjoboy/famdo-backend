var express = require("express");
const session = require("express-session");
var router = express.Router();
familyModel = require("../models/familyModel");

module.exports = {
  /**
   * userController.create()
   */
  create: function (req, res) {
    if (!req.session.userId) {
      return res.status(401).json("user is not logged in");
    }
    var family = new familyModel({
      name: req.body.name,
      owner: req.session.userId,
    });
    family.save(function (err, family) {
      if (err) {
        return res.status(500).json({
          message: "Error when creating family",
          error: err.message,
        });
      } else if (family) {
        console.log(family);
      } else {
        console.log("no family");
      }
      return res.status(201).json(family);
    });
  },
};
