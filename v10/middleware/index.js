//all middleware goes here
var View = require("../models/view");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) { //"middleware" method that you place in a route to make sure that whoever is currently accessing
    if(req.isAuthenticated()) {         //the route is currently logged in as a user
        return next();
    }
    res.redirect("/login");
}

middlewareObj.checkViewOwnership = function(req, res, next) {
    //is user logged in
    if(req.isAuthenticated()){
        View.findById(req.params.id, function(err, foundView) {
            if(err) {
                res.redirect("back") //takes the user back to where they came from
            } else {
                if(foundView.author.id.equals(req.user._id)) { //Does the user own this view
                    next(); //middleware proceeds to next method
                } else {
                    res.redirect("back"); //takes the user back to where they came from
                }
            }
        });
    } else { //if not, redirect
        res.redirect("back"); //takes the user back to where they came from
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    //is user logged in
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err) {
                res.redirect("back") //takes the user back to where they came from
            } else {
                if(foundComment.author.id.equals(req.user._id)) { //Does the user own this view
                    next(); //middleware proceeds to next method
                } else {
                    res.redirect("back"); //takes the user back to where they came from
                }
            }
        });
    } else { //if not, redirect
        res.redirect("back"); //takes the user back to where they came from
    }
}

module.exports = middlewareObj;