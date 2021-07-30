var express = require("express");
const session = require("express-session");
const { Note } = require("../models/familyModel");
var router = express.Router();
familySchema = require("../models/familyModel");
familyModel = familySchema.Family;
scheduleItem = familySchema.ScheduleItem;

userModel = require("../models/userModel.js");
ObjectId = require("mongodb").ObjectID;

module.exports = {
  /**
   * familyController.getFamily()
   */
  getFamily: function (req, res) {
    console.log(req.session.userId);
    familyModel.findById(req.params.id).exec(function (error, family) {
      if (error) {
        return res.status(500).json({ err: error });
      } else {
        if (family === null) {
          return res.status(400).json({ err: error });
        } else {
          if (
            family.members.filter((member) => member.id === req.session.userId)
              .length > 0
          )
            return res.status(200).json(family);
          else {
            return res
              .status(400)
              .json({ err: "user is not a part of this family" });
          }
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

    //update invited users Familiesinvited arr to include the new family
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
          $set: {
            families: req.body.familyId,
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
      return res.status(200).json({ status: "declined" });
    } catch (e) {
      return res.status(500).json({
        message: "error updating user",
        error: e,
      });
    }
  },
  /**
   * familyController.getSchedule()
   */
  getSchedule: async function (req, res) {
    try {
      if (req.session.families) {
        const family = await familyModel.findById(req.session.families);
        if (
          family.members.filter((member) => member.id === req.session.userId)
            .length > 0
        ) {
          return res.status(200).json(family.schedule);
        } else {
          return res.status(401).json({ message: "user is not in the family" });
        }
      } else {
        return res.status(401).json({ message: "user is not in the family" });
      }
      //const family = await familyModel.findById("nekja");
    } catch (e) {
      return res.status(500).json({
        message: "error updating getting schedule",
        error: e,
      });
    }
  },
  createEvent: function (req, res, next) {
    console.log("fam");
    familyModel.authorize(
      req.session.families,
      req.session.userId,
      function (error, family) {
        console.log(req.body.end);
        if (error || !family) {
          return next(error);
        } else {
          const item = {
            title: req.body.event.title,
            description: req.body.event.description,
            start: new Date(req.body.event.start),
            end: new Date(req.body.event.end),
            isAllDay: req.body.event.isAllDay,
            recurrenceRule: req.body.event.recurrenceRule,
            recurrenceExceptions: req.body.event.recurrenceExceptions,
          };
          const item2 = new scheduleItem(item);
          familyModel.updateOne(
            { _id: req.session.families },
            { $push: { schedule: item2 } },
            function (err, numAffected) {
              console.log("callbakc");
              if (err) {
                console.log("upfate");

                return res.status(500).json({
                  message: "Error when creating event",
                  error: err,
                });
              } else if (numAffected.nModified > 0) {
                console.log("upfate2");
                return res.status(201).json({ status: "created", item2 });
              }
            }
          );
        }
      }
    );
  },
  updateEvent: function (req, res, next) {
    familyModel.authorize(
      req.session.families,
      req.session.userId,
      function (error, family) {
        if (error || !family) {
          return next(error);
        } else {
          familyModel.updateOne(
            {
              _id: ObjectId(req.session.families),
              "schedule._id": ObjectId(req.body.event._id),
            },
            {
              $set: {
                "schedule.$.title": req.body.event.title,
                "schedule.$.description": req.body.event.description,
                "schedule.$.start": req.body.event.start,
                "schedule.$.end": req.body.event.end,
                "schedule.$.isAllDay": req.body.event.isAllDay,
                "schedule.$.recurrenceRule": req.body.event.recurrenceRule,
                "schedule.$.recurrenceExceptions":
                  req.body.event.recurrenceExceptions,
              },
            },
            function (err, resp) {
              console.log("err", err, "res", resp);

              if (err) {
                return res.status(500).json({
                  message: "Error updating event",
                  error: err,
                });
              } else if (resp.nModified === 0) {
                return res.status(500).json({
                  message: "Error updating event",
                });
              }
              return res.status(201).json({
                status: "updated",
                res: resp,
              });
            }
          );
        }
      }
    );
  },

  deleteEvent: function (req, res, next) {
    console.log("234", req.params.id);
    familyModel.authorize(
      req.session.families,
      req.session.userId,
      function (error, family) {
        if (error || !family) {
          return next(error);
        } else {
          familyModel.updateOne(
            { _id: req.session.families },
            { $pull: { schedule: { _id: ObjectId(req.params.id) } } },
            function (err, numAffected) {
              if (err || numAffected.nModified === 0) {
                console.log("erreorere");
                return res.status(500).json({
                  message: "Error deleting a event",
                  error: err,
                });
              } else return res.status(202).json({ status: "deleted" });
            }
          );
        }
      }
    );
  },

  createNote: function (req, res, next) {
    console.log("fam");
    familyModel.authorize(
      req.session.families,
      req.session.userId,
      function (error, family) {
        console.log(req.body.end);
        if (error || !family) {
          return next(error);
        } else {
          const item = {
            title: req.body.content.title,
            nontent: req.body.content.nontent,
          };
          const item2 = new Note(item);
          familyModel.updateOne(
            { _id: req.session.families },
            { $push: { notebook: item2 } },
            function (err, numAffected) {
              console.log("callbakc");
              if (err) {
                console.log("upfate");

                return res.status(500).json({
                  message: "Error when creating note",
                  error: err,
                });
              } else if (numAffected.nModified > 0) {
                console.log("upfate2");
                return res.status(201).json({ status: "created", item2 });
              }
            }
          );
        }
      }
    );
  },
  updateNote: function (req, res, next) {
    familyModel.authorize(
      req.session.families,
      req.session.userId,
      function (error, family) {
        if (error || !family) {
          return next(error);
        } else {
          familyModel.updateOne(
            {
              _id: ObjectId(req.session.families),
              "schedule._id": ObjectId(req.body.note._id),
            },
            {
              $set: {
                "schedule.$.title": req.body.event.title,
                "schedule.$.content": req.body.note.content,
              },
            },
            function (err, resp) {
              console.log("err", err, "res", resp);

              if (err) {
                return res.status(500).json({
                  message: "Error updating note",
                  error: err,
                });
              } else if (resp.nModified === 0) {
                return res.status(500).json({
                  message: "Error updating note",
                });
              }
              return res.status(201).json({
                status: "updated",
                res: resp,
              });
            }
          );
        }
      }
    );
  },
};
