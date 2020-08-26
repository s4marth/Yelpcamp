var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");
var middleware = require("../middleware");



//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
       }
    });
});

//Create 
router.post("/", middleware.isLoggedIn, function(req, res){
		 //get data from form and add to camprounds array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, price: price, image: image, description: desc, author: author}
	    //create a new campground and save to the database
	    Campground.create(newCampground, function(err, newlycreated){
			if(err){
				console.log(err);
			}else{
				//redirect back to campgrounds page
				console.log(newlycreated);
				 res.redirect("/campgrounds");
			}
		});
	     
	 });
//new- show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new")
});

//show page- shows more info about one campground
router.get("/:id", function(req, res){
	//find the campground with the provided provided
	Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundCampground){
		if(err){
			console.log(err);
		}else{
			//render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});


//edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	//is user loggedin?
	Campground.findById(req.params.id, function(err, foundCampground){
		
			res.render("campgrounds/edit", {campground: foundCampground});
		});
});

//update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
     //find and update the campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
	//redirect somewhere
});


//destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}else {
            // deletes all comments associated with the campground
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                    //  delete the campground
                    campground.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/campgrounds");
                });
            });
        }
    });
});






module.exports = router;