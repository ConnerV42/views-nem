var mongoose = require("mongoose");
var View = require("./models/view");
var Comment = require("./models/comment");

var data = [
    {
        name: "Test", 
        image: "https://images.unsplash.com/photo-1533765204875-741de68c678e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=85f7d010307ca1ff3e6d0674a611e2a1&auto=format&fit=crop&w=800&q=60",
        description: "Test Test Test"
    },
    {
        name: "Test2", 
        image: "https://images.unsplash.com/photo-1533765204875-741de68c678e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=85f7d010307ca1ff3e6d0674a611e2a1&auto=format&fit=crop&w=800&q=60",
        description: "Test Test Test"
    },
    {
        name: "Test3", 
        image: "https://images.unsplash.com/photo-1533765204875-741de68c678e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=85f7d010307ca1ff3e6d0674a611e2a1&auto=format&fit=crop&w=800&q=60",
        description: "Test Test Test"
    }
]

function seedDB() { //We execute the creation of new views inside of the remove all views callback function to ensure that all views are removed prior to the new ones being added
    //remove all Views
    View.remove({}, function(err){
        if(err) {
            console.log(err);
        } else {
            console.log("Removed From DB");
            //add a few Views
            data.forEach(function(seed){
                View.create(seed, function(err, newView){
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("Added a View");
                        //Create a comment on each campground
                        Comment.create(
                            {
                                text: "This is a comment!",
                                author: "Conner Verret"
                            }, function(err, comment) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    newView.comments.push(comment);
                                    newView.save();
                                    console.log("Created a new comment");
                                }
                            }
                        );
                    }
                });
            });
        }
    });
}
module.exports = seedDB;

