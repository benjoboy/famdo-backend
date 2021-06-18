var express = require("express");
const session = require("express-session");
var router = express.Router();
familyModel = require("../models/familyModel");
userModel = require("../models/userModel.js");
ObjectId = require("mongodb").ObjectID;

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

  invite: function (req, res) {
    //userid, familyId, TODO push invite to user and push invited user to family
    if (!req.session.userId) {
      return res.status(401).json("user is not logged in");
    }
    familyModel.findById(req.body.familyId).exec(function (err, family) {
      if (err)
        return res.status(500).json({
          message: "error getting family",
          error: err,
        });
      else if (family) {
        if (family.owner.toString() !== req.session.userId) {
          console.log(
            "user is not the owner of this family",
            family.owner,
            req.session.userId
          );
          return res
            .status(401)
            .json({ message: "user is not the owner of this family" });
        }
      }
    });

    userModel.updateOne(
      {
        _id: ObjectId(req.body.invitedUserId),
      },
      {
        $push: {
          invitedFamilies: { id: req.body.familyId },
        },
      },
      function (err, user) {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error adding invite to user" });
        }
      }
    );

    familyModel.updateOne(
      {
        _id: ObjectId(req.body.familyId),
      },
      {
        $push: {
          invites: { id: req.body.invitedUserId },
        },
      },
      function (err, family) {
        if (err) {
          return res.status(500).json({
            message: "Error adding invite",
            error: err,
          });
        } else if (family.nModified === 0) {
          return res.status(500).json({
            message: "Error adding invite",
          });
        }
        return res.status(201).json({
          status: "invited",
          family: family,
        });
      }
    );
  },
};
