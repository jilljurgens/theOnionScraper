// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
//get rid of mongojs??????????????
// var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var db = require("./models");

// Initialize Express
var app = express();
app.use(bodyParser.json());
// Database configuration
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// var databaseUrl = "mongoHeadlines";
// var collections = ["scrapedData"];
//set up handlebars 
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
     
// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.Article.find({}, function(error, data) {

      var wrapper  = {articles: data};

    if (error) {
      console.log(error);
    }

    else {
      //console.log(wrapper);
      res.render("allArticles", wrapper)
      };
      
      //res.json(data);
      //console.log(data);
    });
  })
  // );
// });
// Retrieve SAVED articles from the db
app.get("/saved", function(req, res) {
  
  db.Article.find({"saved": "true"}, function(error, data) {

    var wrapper  = {articles: data};

    if (error) {
      console.log(error);
    }

    else {
      //console.log(wrapper);
      res.render("savedArticles", wrapper)
      };
      
 
    });
  })
// Retrieve article by id
app.get("/all/:id", function(req, res){
  db.Article.findOne({_id: req.params.id})
  .populate("note")
  .then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  });
});

app.post("/all/:id", function(req, res){
  //console.log(req.body);
  db.Note
  .create(req.body)
  .then(function(dbNote){
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { "note": dbNote._id }, { new: true });
  })
  .then(function(dbArticle){
    //console.log(dbArticle);
    res.json(dbArticle);
  })
  .catch(function(err){
    res.json(err);
  });
});




// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  request("https://www.theonion.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "headline--wrapper" class
   $(".headline--wrapper").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children("a").children("h3").text();
      var link = $(element).children("a").attr("href");
      var excerpt = $(element).children("p").text();
 
      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.Article.create({
          title: title,
          link: link,
          excerpt: excerpt
        },
        function(err, inserted) {
          if (err) {
            console.log(err);
          }
          else {
            // If no error, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});
// do a GET to display saved articles
//do a GET to display the notes with an associated article

// Listen on port 3000
var port = process.env.PORT || 3000
app.listen(port, function() {
  console.log("App running on port 3000!");
});

