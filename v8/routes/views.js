var express = require("express");
var router = express.Router();
var View = require("../models/view");

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
router.post("/", function(req, res){
   //get data from the form and add to views database
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var newView = {name: name, image: image, description: desc};
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
router.get("/new", function(req, res){
   res.render("views/new.ejs"); 
});

// SHOW ROUTE - shows more info about one view 
router.get("/:id", function(req, res){
    //find the campground with the provided id
    View.findById(req.params.id).populate("comments").exec( function(err, foundView){
       if(err){
           console.log(err);
       } else {
           console.log(foundView)
           res.render("views/show", {view: foundView});
       }
    });
});

module.exports = router;
