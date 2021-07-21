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
/*
familySchema.statics.authorize = function () {

}*/
