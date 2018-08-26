var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    View = require("./models/view"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds");
   
//requiring routes 
var viewRoutes = require("./routes/views"),
    commentRoutes = require("./routes/comments"),
    indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost/viewsdb_v10");
app.use(bodyParser.urlencoded({extended: true})); 
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public/")); //__dirname basically gets the absolute directory path
app.use(methodOverride("_method"));
//seed the database
//seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Jax wins cutest dog!",
    resave: false,
    saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user; //allows "currentUser" variable to be accessed from any route (.js) or template (.ejs) file
   next();
});

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

//using required javascript route files
app.use("/views", viewRoutes);
app.use("/views/:id/comments", commentRoutes);
app.use("/", indexRoutes);

// ================================================================
// Server Listener
// ================================================================

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Views Server has started!"); 
});