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
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongoHeadlines", {
  useMongoClient: true
});
// var databaseUrl = "mongoHeadlines";
// var collections = ["scrapedData"];
//set up handlebars 
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });
      // var test = [
      //   {body: "body test",
      //   title: "title test",
      //   excerpt: "excerpt test"
      //   },
      //   {
      //   body: "body test2",
      //   title: "title test2",
      //   excerpt: "excerpt test2"
      //   },{
      //   body: "body test2",
      //   title: "title test2",
      //   excerpt: "excerpt test2"
      //   }
      //   ]
// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.Article.find({}, function(error, data) {
    // Throw any errors to the console
      // var articles = {
      //   id: data._id,
      //   title: data.title,
      //   link: data.link,
      //   excerpt: data.excerpt
      // };
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.render("allArticles", data)
      };
      


    
      //res.json(data);

      //console.log(data);
    });
  })
  // );
// });

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
  console.log(req.body);
  db.Note
  .create(req.body)
  .then(function(dbNote){
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
  })
  .then(function(dbArticle){
    res.json(dbArticle);
  })
  .catch(function(err){
    res.json(err);
  });
});


// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of ycombinator
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

//do a GET to display the notes with an associated article

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});

