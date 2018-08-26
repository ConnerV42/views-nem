var express = require("express");
var router = express.Router();
var View = require("../models/view");
var middleware = require("../middleware"); //normally, index would also be in the path but it is a special name w/ express so google it for more info 
var request = require("request");
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
  api_key: 0000000000000, 
  api_secret: "YOU DONT GET TO KNOW"
});

//INDEX - Show all views
router.get("/", function(req, res){
    // Get all views from DB
    View.find({}, function(err, allViews){
       if(err) {
           console.log(err);
       } else {
           res.render("views/index", {views: allViews, page: "views"});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", upload.single('image'), middleware.isLoggedIn, function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.view.image = result.secure_url;
      // add image's public_id to campground object
      req.body.view.imageId = result.public_id;
      // add author to campground
      req.body.view.author = {
        id: req.user._id,
        username: req.user.username
      }
      View.create(req.body.view, function(err, view) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/views/' + view.id);
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
router.put("/:id", upload.single('image'), function(req, res){
    View.findById(req.params.id, async function(err, view){
        console.log(req.body); //this is just here for debugging purposes
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
            view.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/views/" + view._id);
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

module.exports = router;
