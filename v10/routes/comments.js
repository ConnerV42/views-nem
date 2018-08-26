var express = require("express");
var router = express.Router({mergeParams: true});
var View = require("../models/view");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New Route
router.get("/new", middleware.isLoggedIn, function(req, res){
    View.findById(req.params.id, function(err, view){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {view: view});
        }
    });
});

//Comments Create Route
router.post("/", middleware.isLoggedIn, function(req, res){
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
                  // add username and id to comments
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  //save comment
                  comment.save();
                  view.comments.push(comment);
                  view.save();
                  res.redirect("/views/" + view._id);
              }
           });
       }
    });
});


//Comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {view_id: req.params.id, comment: foundComment}); //req.params.id holds the viewid data from app.js
        }
    });
});

router.put("/:comment_id", function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err) {
          res.redirect("back");
      } else {
          res.redirect("/views/" + req.params.id);
      }
   });
});

router.delete("/:comment_id", function(req, res){
    //find by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, req.body.comment, function(err){
        if(err) {
            res.redirect("back");
        } else {
            res.redirect("/views/" + req.params.id);
        }
    });
});

module.exports = router;