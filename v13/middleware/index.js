//all middleware goes here
var View = require("../models/view");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) { //"middleware" method that you place in a route to make sure that whoever is currently accessing
    if(req.isAuthenticated()) {         //the route is currently logged in as a user
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObj.checkViewOwnership = function(req, res, next) {
    //is user logged in
    if(req.isAuthenticated()){
        View.findById(req.params.id, function(err, foundView) {
            if(err || !foundView) {
                req.flash("error", "View not found in database");
                res.redirect("back") //takes the user back to where they came from
            } else {
                if(foundView.author.id.equals(req.user._id)) { //Does the user own this view
                    next(); //middleware proceeds to next method
                } else {
                    req.flash("error", "You don't have permission to that");
                    res.redirect("back"); //takes the user back to where they came from
                }
            }
        });
    } else { //if not, redirect
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back"); //takes the user back to where they came from
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    //is user logged in
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment) {
                req.flash("error", "Comment not found in database");
                res.redirect("back") //takes the user back to where they came from
            } else {
                if(foundComment.author.id.equals(req.user._id)) { //Does the user own this view
                    next(); //middleware proceeds to next method
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back"); //takes the user back to where they came from
                }
            }
        });
    } else { //if not, redirect
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back"); //takes the user back to where they came from
    }
}

module.exports = middlewareObj;