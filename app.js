var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var methodOverride = require("method-override");
var LocalStrategy = require("passport-local");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");

//requiring routes
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var reviewRoutes     = require("./routes/reviews");
var indexRoutes = require("./routes/index");




//mongoose.connect("mongodb://localhost/yelp_camp", {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect("mongodb+srv://s4marth:s@marth1303@cluster0.boand.mongodb.net/Cluster0?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.locals.moment = require('moment');
//seedDB();  //seed the data base


//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "rusty is good",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


//Campground.create({
//   name: "mount everest", 
//	image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
//	description: "this is huge mount everest, having no bathrooms, no water, beautiful views"
//}, function(err, campground){
//	if(err){
//		console.log(err);
//	}else{
//		console.log("Newly created campground");
//		console.log(campground);
//	}
//});



app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);




app.listen(process.env.PORT, process.env.IP, function(){
	console.log("yelpcamp server has started");
});