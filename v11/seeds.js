var mongoose = require("mongoose");
var View = require("./models/view");
var Comment = require("./models/comment");

var data = [
    {
        name: "Downtown Spokane River", 
        image: "https://farm5.staticflickr.com/4461/38066017492_a17699dd5a.jpg",
        description: "The other thing with Lorem Ipsum is that you have to take out its family. Lorem Ipsum is the single greatest threat. We are not - we are not keeping up with other websites. An ‘extremely credible source’ has called my office and told me that Barack Obama’s placeholder text is a fraud. Lorem Ipsum is the single greatest threat. We are not - we are not keeping up with other websites."
    },
    {
        name: "Spokane River Flowing", 
        image:"https://farm9.staticflickr.com/8588/16431873628_c70b19b22e_b.jpg",
        description: "You have so many different things placeholder text has to be able to do, and I don't believe Lorem Ipsum has the stamina. You have so many different things placeholder text has to be able to do, and I don't believe Lorem Ipsum has the stamina. Look at that text! Would anyone use that? Can you imagine that, the text of your next webpage?! An ‘extremely credible source’ has called my office and told me that Barack Obama’s placeholder text is a fraud. My placeholder text, I think, is going to end up being very good with women. An 'extremely credible source' has called my office and told me that Lorem Ipsum's birth certificate is a fraud. I think my strongest asset maybe by far is my temperament. I have a placeholding temperament."
    },
    {
        name: "Riverfront Park", 
        image: "https://farm5.staticflickr.com/4445/37386351264_c32f2b194a.jpg",
        description: "All of the words in Lorem Ipsum have flirted with me - consciously or unconsciously. That's to be expected. If Trump Ipsum weren’t my own words, perhaps I’d be dating it."
    }
]

function seedDB() { //We execute the creation of new views inside of the remove all views callback function to ensure that all views are removed prior to the new ones being added
    //remove all Views
    View.remove({}, function(err){
    
    });
}
module.exports = seedDB;

