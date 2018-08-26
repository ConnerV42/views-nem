var express = require("express");
var router = express.Router();
var View = require("../models/view");
var middleware = require("../middleware"); //normally, index would also be in the path but it is a special name w/ express so google it for more info 
var request = require("request");
var multer = require('multer');
var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
var geocoder = NodeGeocoder(options);
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

//INDEX - Show all views
router.get("/", function(req, res){
    var noMatch = "empty";
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        View.find({name: regex}, function(err, searchedViews){
           if(err){
               console.log(err);
           } else {
              if(searchedViews.length < 1) {
                  req.flash("error", "No results found for this search query");
                  res.redirect("/views");
              }
              res.render("views/index", {views: searchedViews});
           }
        });
    } else {
        // Get all views from DB
        View.find({}, function(err, allViews){
           if(err) {
               console.log(err);
           } else {
               res.render("views/index", {views: allViews, page: "views"});
           }
        });  
    }
});

//CREATE - add new campground to DB
router.post("/", upload.single("image"), middleware.isLoggedIn, function(req, res) {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            console.log(err);
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var name = req.body.view.name;
        var desc = req.body.view.description;
        console.log("yes");
        var author = {
            id: req.user._id,
            username: req.user.username
        };
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newView = {name: name, description: desc, author: author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to DB
        cloudinary.v2.uploader.upload(req.file.path, function(err, result){
            if(err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            newView.image = result.secure_url;
            newView.imageId = result.public_id;
            View.create(newView, function(err, newlyCreated){
                if(err){
                    console.log(err);
                } else {
                    //redirect back to views page
                    console.log(newlyCreated);
                    res.redirect("/views");
                }
            });
        });
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
router.put("/:id", upload.single('image'), middleware.checkViewOwnership, function(req, res){
    View.findById(req.params.id, async function(err, view){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(view.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  view.imageId = result.public_id;
                  view.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            view.name = req.body.name;
            view.description = req.body.description;
            geocoder.geocode(req.body.location, function (err, data) {
                if (err || !data.length) {
                    req.flash('error', 'Invalid address');
                    return res.redirect('back');
                }
                view.lat = data[0].latitude;
                view.lng = data[0].longitude;
                view.location = data[0].formattedAddress;
                view.save()
                req.flash("success", "Successfully Updated!");
                res.redirect("/views/" + view._id);
            });
        }
    });
});


//destroy view route
router.delete('/:id', function(req, res) {
  View.findById(req.params.id, async function(err, view) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(view.imageId);
        view.remove();
        req.flash('success', 'View deleted successfully!');
        res.redirect('/views');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
