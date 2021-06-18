var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var familySchema = new Schema({
  owner: Schema.Types.ObjectId,
  name: String,
  members: [],
  invites: [],
});

var Family = mongoose.model("Family", familySchema);
module.exports = Family;
