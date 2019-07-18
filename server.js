var express = require("express");
// var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");

var db = require("./modals");

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


var DB_URI = process.env.MONGODB_URI || "mongodb://localhost/News-Scraper";

mongoose.connect(DB_URI, {
  useNewUrlParser: true
});
app.get("/", function(req, res) {
  res.send("Hello world");
});

app.get("/json", function(req, res) {
  db.Article.find({}, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  });
});

app.get("/scrape", function(req, res) {
  axios
    .get("https://www.statesman.com/")
    .then(function(response) {
      var $ = cheerio.load(response.data);
      $("h1").each(function(i, element) {
        var result = {};

        result.title = $(this).text();
        result.link = $(this)
          .children("a")
          .attr("href");

        db.Article.create(result)
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
            console.log(err);
          });
      });
      res.send("Scrape Complete");
    });
});




app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
 
  app.post("/articles/:id", function(req, res) {
  
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

app.listen(3000, function() {
  console.log("App running on port 3000!");

});
