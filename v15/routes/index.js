var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var View = require("../models/view");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: "connerv42", 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get("/", function(req, res){
   res.render("landing"); 
});

//render sign up form
router.get("/register", function(req, res){
    res.render("register", {page: "register"});
});

//Handling user registration
router.post("/register", upload.single('image'), function(req, res){ //register method takes a user object that doesn't have a password attached, and then a hashed the password in the next method
    cloudinary.v2.uploader.upload(req.file.path, function(err, result){
        if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        var newUser = new User(
            {
                firstName: req.body.firstName, 
                lastName: req.body.lastName, 
                username: req.body.username, 
                email: req.body.email, 
                avatarImage: result.secure_url, 
                avatarImageId: result.public_id
            });
        User.register(newUser, req.body.password, function(err, user){
            if(err) {
                console.log(err);
                return res.render("register", {error: err.message});
            } else {
                passport.authenticate("local")(req, res, function(){
                    req.flash("success", "Welcome to Views, " + user.username + "!");
                    res.redirect("/views"); 
                });
            }
        });
    });
});

//Render login form
router.get("/login", function(req, res){
    res.render("login", {page: "login"});
})

//handling login logic
router.post("/login", function (req, res, next) {
  passport.authenticate("local",
    {
      successRedirect: "/views",
      failureRedirect: "/login",
      failureFlash: true,
      successFlash: "Welcome to Views, " + req.body.username + "!"
    })(req, res);
});

//Logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/views");
});

// USER PROFILE ROUTES
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser){
        if(err) {
            req.flash("flash", "Something went wrong!");
            res.redirect("/");
        } else {
            View.find().where('author.id').equals(foundUser._id).exec(function(err, views){
                if(err) {
                    req.flash("error", "Something went wrong");
                    res.redirect("/");
                }
                res.render("users/show", {user: foundUser, views: views});
            });
        }
    });
});

module.exports = router;