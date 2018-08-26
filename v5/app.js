var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    View = require("./models/view"),
    Comment = require("./models/comment"),
    seedDB = require("./seeds");

mongoose.connect("mongodb://localhost/viewsdb_v5");
app.use(bodyParser.urlencoded({extended: true})); 
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public/")); //__dirname basically gets the absolute directory path
seedDB();

var viewsArray = [
    
        {name: "Downtown Spokane River", image: "https://farm5.staticflickr.com/4461/38066017492_a17699dd5a.jpg"},
        {name: "Downtown Spokane", image: "https://farm8.staticflickr.com/7438/27204094683_06b593ef33.jpg"},
        {name: "Iron Bridge", image: "https://farm9.staticflickr.com/8710/17196166358_3b6ebf44c7.jpg"},
        {name: "Near Parkade Plaza", image: "https://farm5.staticflickr.com/4428/36662132000_b59dd5572f.jpg"},
        {name: "Maple Street Bridge", image: "https://farm8.staticflickr.com/7404/12369917523_3091aca308.jpg"},
        {name: "Riverfront Park Spokane", image: "https://farm5.staticflickr.com/4445/37386351264_c32f2b194a.jpg"},
        {name: "Spokane Riverbank", image: "https://farm4.staticflickr.com/3675/9416605560_a0500495b6.jpg"},
        {name: "Post Bridge", image: "https://farm9.staticflickr.com/8751/17198652918_fd5b0999ec.jpg"},
        {name: "Sunrise", image: "https://farm5.staticflickr.com/4480/37393916474_bb91898648.jpg"},
        {name: "Downtown Spokane", image: "https://theculturetrip.com/wp-content/uploads/2015/11/2309029891_725f89a507_b.jpg"},
        {name: "Clocktower", image: "https://api.trekaroo.com//photos/flickr_cache/46735/46735.jpg"},
        {name: "Riverfront Park in the Winter", image: "http://scelnews.com.s3.amazonaws.com/wp-content/uploads/2014/01/river-front-park-spokane.jpg"},
        {name: "Gondolas Above Spokane River", image: "http://www.historylink.org/Content/Media/Photos/Large/Spokane_Falls_6-30-2014.jpg"},
        {name: "Forest", image: "https://s3.amazonaws.com/iexplore_web/images/assets/000/001/383/original/Spokane-Kidron_Cool.jpg?1435957459"},
        {name: "Trent and Hamilton", image: "https://www.aaroads.com/west/washington090/i-090_eb_exit_282_02.jpg"},
        {name: "Spokane River Flowing", image:"https://farm9.staticflickr.com/8588/16431873628_c70b19b22e_b.jpg"},
        {name: "2 Main Features", image:"http://farm4.staticflickr.com/3588/3505956193_e22131c8fc_b.jpg"},
        {name: "McCain and Obama Bicken", image: "https://c1.staticflickr.com/4/3241/2876390035_503e3976c3_b.jpg"}
]


app.get("/", function(req, res){
   res.render("landing"); 
});

//INDEX - Show all views
app.get("/views", function(req, res){
    // Get all views from DB
    View.find({}, function(err, allViews){
       if(err) {
           console.log(err);
       } else {
           res.render("views/index", {views:allViews});
       }
    });
});

//CREATE ROUTE - Add new view to database
app.post("/views", function(req, res){
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
app.get("/views/new", function(req, res){
   res.render("views/new.ejs"); 
});

// SHOW ROUTE - shows more info about one view 
app.get("/views/:id", function(req, res){
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

// ======================================================
// COMMENT ROUTES
// ======================================================

app.get("/views/:id/comments/new", function(req, res){
    View.findById(req.params.id, function(err, view){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {view: view});
        }
    });
});

app.post("/views/:id/comments", function(req, res){
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

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Views Server has started!");
})