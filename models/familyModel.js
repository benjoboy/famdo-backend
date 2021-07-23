var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const ScheduleItemSchema = new Schema({
  id: Schema.Types.ObjectId,
  title: String,
  description: String,
  start: Date,
  end: Date,
  isAllDay: Boolean,
  recurrenceRule: String,
  recurrenceExceptions: Date,
});

var familySchema = new Schema({
  owner: Schema.Types.ObjectId,
  name: String,
  members: [],
  invites: [],
  schedule: [ScheduleItemSchema],
});

//authorize user as member of family
familySchema.statics.authorize = async function (families, userId, callback) {
  try {
    if (families) {
      const family = await familyModel.findById(families);
      if (family.members.filter((member) => member.id === userId).length > 0) {
        console.log("callback");
        return callback(null, family);
      } else {
        var err = new Error("User is not part of the family.");
        err.status = 401;
        return callback(err, null);
      }
    } else {
      var err = new Error("User is not part of a family.");
      err.status = 401;
      return callback(err, null);
    }
  } catch (e) {
    console.log("mhm");
    throw e;
  }
};

var ScheduleItem = mongoose.model("ScheduleItem", ScheduleItemSchema);
var Family = mongoose.model("Family", familySchema);
module.exports = { Family, ScheduleItem };
