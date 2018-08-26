var express = require("express");
var router = express.Router({mergeParams: true});
var View = require("../models/view");
var Comment = require("../models/comment");

//Comments New Route
router.get("/new", isLoggedIn, function(req, res){
    View.findById(req.params.id, function(err, view){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {view: view});
        }
    });
});

//Comments Create Route
router.post("/", isLoggedIn, function(req, res){
    //lookup view by id
    View.findById(req.params.id, function(err, view){
       if(err) {
           console.log(err);
           res.redirect("/views");
       } else {
           //create new comments
           Comment.create(req.body.comment, function(err, comment) {
              if(err) {
                  console.log(err);
              } else {
                  view.comments.push(comment);
                  view.save();
                  res.redirect("/views/" + view._id);
              }
           });
       }
    });
});

function isLoggedIn(req, res, next) { //"middleware" method that you place in a route to make sure that whoever is currently accessing
    if(req.isAuthenticated()) {         //the route is currently logged in as a user
        return next();
    }
    res.redirect("/login");
}

module.exports = router;