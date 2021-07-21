var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const ScheduleItemSchema = new Schema({
  title: String,
  description: String,
  start: Date,
  end: Date,
  isAllDay: false,
});

var familySchema = new Schema({
  owner: Schema.Types.ObjectId,
  name: String,
  members: [],
  invites: [],
  schedule: [ScheduleItemSchema],
});

var ScheduleItem = mongoose.model("ScheduleItem", ScheduleItemSchema);
var Family = mongoose.model("Family", familySchema);
module.exports = { Family, ScheduleItem };

//authorize user as member of family

familySchema.statics.authorize = async function () {
  try {
    if (req.session.families) {
      const family = await familyModel.findById(req.session.families);
      if (
        family.members.filter((member) => member.id === req.session.userId)
          .length > 0
      ) {
        return callback(null, family);
      } else {
        var err = new Error("User is not part of the family.");
        err.status = 401;
        return callback(err);
      }
    } else {
      var err = new Error("User is not part of a family.");
      err.status = 401;
      return callback(err);
    }
  } catch (e) {}
};
