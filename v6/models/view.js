//SCHEMA SETUP for MONGOOSE
var mongoose = require("mongoose");

var viewSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   comments: [ //Here we are building a reference to comment id's by association, hence the ref tag that is labeled, "Comment"
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("View", viewSchema);