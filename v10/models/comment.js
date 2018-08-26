var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
        username: String
    },
    
});

module.exports = mongoose.model("Comment", commentSchema); //mongoose.model is the function that converts the comment schema variable into the singular db entry of Comment