var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", function(req, res){
   res.render("landing"); 
});

//render sign up form
router.get("/register", function(req, res){
    res.render("register");
});

//Handling user registration
router.post("/register", function(req, res){ //register method takes a user object that doesn't have a password attached, and then a hashed the password in the next method
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err) {
            console.log(err);
            res.render("register");
        } else {
            passport.authenticate("local")(req, res, function(){
              res.redirect("/views"); 
            });
        }
    });
});

//Render login form
router.get("/login", function(req, res){
    res.render("login");
})

//handling login logic
router.post("/login", passport.authenticate("local",
    {   
        successRedirect: "/views",
        failureRedirect: "/login"
    }),
    function(req, res){
    
});

//Logout route
router.get("/logout", function(req, res){
   req.logout();
   res.redirect("/views");
});

module.exports = router;