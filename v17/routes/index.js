var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var View = require("../models/view");
var the_async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var multer = require("multer");
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

// forgot password
router.get('/forgot', function(req, res) {
    res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
    the_async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
    
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                    user: 'viewsresetpass@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'learntocodeinfo@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], 
    function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
    });
});

router.post('/reset/:token', function(req, res) {
    the_async.waterfall([
    function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              return res.redirect('back');
            }
            if(req.body.password === req.body.confirm) {
                user.setPassword(req.body.password, function(err) {
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
    
                    user.save(function(err) {
                        req.logIn(user, function(err) {
                            done(err, user);
                        });
                    });
                });
            } else {
                req.flash("error", "Passwords do not match.");
                return res.redirect('back');
            }
        });
    },
    function(user, done) {
        var smtpTransport = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
                user: 'resetviewspass@gmail.com',
                pass: process.env.GMAILPW
            }
        });
        var mailOptions = {
            to: user.email,
            from: 'resetviewspass@gmail.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
            req.flash('success', 'Success! Your password has been changed.');
            done(err);
        });
    }
    ],
    function(err) {
        res.redirect('/views');
    });
});

module.exports = router;