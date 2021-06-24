var express = require("express");
const session = require("express-session");
var router = express.Router();
familyModel = require("../models/familyModel");
userModel = require("../models/userModel.js");
ObjectId = require("mongodb").ObjectID;

module.exports = {
  /**
   * familyController.getFamily()
   */
  getFamily: function (req, res) {
    familyModel.findById(req.params.id).exec(function (error, family) {
      if (error) {
        return res.status(500).json({ err: error });
      } else {
        if (family === null) {
          return res.status(400).json({ err: error });
        } else {
          return res.status(200).json(family);
        }
      }
    });
  },

  /**
   * familyController.create()
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
  /**
   * familyController.invite()
   */
  invite: async function (req, res) {
    //userid, familyId, TODO push invite to user and push invited user to family
    if (!req.session.userId) {
      return res.status(401).json("user is not logged in");
    }

    try {
      //get family
      const family = await familyModel.findById(req.body.familyId);
      if (family) {
        //check if the user who sent invite is the owner
        if (family.owner.toString() !== req.session.userId) {
          console.log(
            "user is not the owner of this family",
            family.owner,
            req.session.userId
          );
          return res.status(401).json({
            message: "user is not the owner of this family",
            error: err,
          });
        }
      }
    } catch (e) {
      return res.status(500).json({
        message: "error getting family",
        error: e,
      });
    }

    //update invited users invitedFamilies arr to include the new family
    console.log("here");
    try {
      const user = await userModel.updateOne(
        {
          _id: ObjectId(req.body.invitedUserId),
        },
        {
          $push: {
            invitedFamilies: { id: req.body.familyId },
          },
        }
      );
    } catch (e) {
      return res.status(500).json({ message: "Error adding invite to user" });
    }

    //update family to include the new invited user
    try {
      const family2 = await familyModel.updateOne(
        {
          _id: ObjectId(req.body.familyId),
        },
        {
          $push: {
            invites: { id: req.body.invitedUserId },
          },
        }
      );
      if (family2.nModified === 0) {
        return res.status(500).json({
          message: "Error adding invite",
        });
      }
      return res.status(201).json({
        status: "invited",
        family: family2,
      });
    } catch (e) {
      return res.status(500).json({
        message: "Error adding invite",
        error: e,
      });
    }
  },
  /**
   * familyController.acceptInvite()
   */
  acceptInvite: async function (req, res) {
    //body.familyId
    // get family check if he is invited.
    //update users invitedfamilies and families arr
    //update family members and invited

    try {
      //get family
      console.log(req.body.familyId);
      const family = await familyModel.findById(req.body.familyId);
      if (family) {
        //check if the user is invited
        let invited = false;
        family.invites.forEach((invite) => {
          console.log(req.session.userId, invite.id);
          if (invite.id === req.session.userId) {
            invited = true;
          }
        });
        if (!invited) {
          console.log("err");
          return res.status(201).json({
            message: "user was not invited",
          });
        }
      }
    } catch (e) {
      console.log("error");
      return res.status(500).json({
        message: "error getting family",
        error: e,
      });
    }

    //update users families array
    try {
      const user = await userModel.updateOne(
        {
          _id: ObjectId(req.session.userId),
        },
        {
          $pull: {
            invitedFamilies: { id: req.body.familyId },
          },
          $push: {
            families: { id: req.body.familyId },
          },
        }
      );
    } catch (e) {
      return res.status(500).json({
        message: "error updating user",
        error: e,
      });
    }

    //update family members and invited
    try {
      const family = await familyModel.updateOne(
        {
          _id: ObjectId(req.body.familyId),
        },
        {
          $pull: {
            invites: { id: req.session.userId },
          },
          $push: {
            members: { id: req.session.userId },
          },
        }
      );
      console.log(family);
    } catch (e) {
      return res.status(500).json({
        message: "error updating family",
        error: e,
      });
    }

    return res.status(200).json({ status: "accepted" });
  },
  /**
   * familyController.declineInvite()
   */
  declineInvite: async function (req, res) {
    //update user
    try {
      user = await userModel.updateOne(
        {
          _id: ObjectId(req.session.userId),
        },
        {
          $pull: {
            invitedFamilies: { id: req.body.familyId },
          },
        }
      );
    } catch (e) {
      return res.status(500).json({
        message: "error updating user",
        error: e,
      });
    }
    //update family
    try {
      family = await familyModel.updateOne(
        {
          _id: ObjectId(req.body.familyId),
        },
        {
          $pull: {
            invites: { id: req.session.userId },
          },
        }
      );
      return res.status(200).json({ message: "invite declined" });
    } catch (e) {
      return res.status(500).json({
        message: "error updating user",
        error: e,
      });
    }
  },
};
