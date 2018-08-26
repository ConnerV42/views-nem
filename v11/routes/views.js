var express = require("express");
var router = express.Router();
var View = require("../models/view");
var middleware = require("../middleware"); //normally, index would also be in the path but it is a special name w/ express so google it for more info 

//INDEX - Show all views
router.get("/", function(req, res){
    // Get all views from DB
    View.find({}, function(err, allViews){
       if(err) {
           console.log(err);
       } else {
           res.render("views/index", {views: allViews});
       }
    });
});

//CREATE ROUTE - Add new view to database
router.post("/", middleware.isLoggedIn, function(req, res){
   //get data from the form and add to views database
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   }
   var newView = {name: name, image: image, description: desc, author: author};
   //Create new campground and save to DB
   View.create(newView, function(err, newlyCreated){
        if(err) {
            console.log(err);
        } else {
            //redirect back to the viewsPage
            res.redirect("/views");
        }
   });
});

//NEW ROUTE - show form to create new view
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("views/new.ejs"); 
});

// SHOW ROUTE - shows more info about one view 
router.get("/:id", function(req, res){
    //find the campground with the provided id
    View.findById(req.params.id).populate("comments").exec( function(err, foundView){
       if(err || !foundView){
           req.flash("error", "View not found in database");
           res.redirect("back");
       } else {
           console.log(foundView)
           res.render("views/show", {view: foundView});
       }
    });
});

//edit view route
router.get("/:id/edit", middleware.checkViewOwnership, function(req, res) {
    View.findById(req.params.id, function(err, foundView) {
        if(err) {
            req.flash("error", "View not found in database");
        } else {
            res.render("views/edit", {view: foundView});
        }
    });
});

//update view route
router.put("/:id", middleware.checkViewOwnership, function(req, res){
    //find and update the correct view
    View.findByIdAndUpdate(req.params.id, req.body.view, function(err, updatedView){
        if(err) {
            res.redirect("/views");
        } else { //redirect to the show page for that view
            res.redirect("/views/" + req.params.id);
        }
    });
});

//destroy view route
router.delete("/:id", middleware.checkViewOwnership, function(req, res){
    View.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/views");
        } else {
            res.redirect("/views"); 
        }
    }); 
});

module.exports = router;
