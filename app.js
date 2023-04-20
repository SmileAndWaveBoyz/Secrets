const fs = require("fs");
let jsonFile =[];
// let json = require('./public/data.json');
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");

const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const { log } = require("console");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

var userNameLogin = "";

app.use(passport.initialize());
app.use(passport.session());

//Setting up the users data base inside userDB
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
// mongoose.connect("mongodb+srv://SmileAndWaveBoyz:Newcross971@cluster0.o6lompz.mongodb.net/userDB", {useNewUrlParser: true});

mongoose.set("useCreateIndex", true);

//Setting up the paths data base inside userDB
const trendingSchema = new mongoose.Schema ({
  small: String,
  large: String
});

const regularSchema = new mongoose.Schema ({
  small: String,
  medium: String,
  large: String
});

const thumbnailSchema = new mongoose.Schema ({
  trending: trendingSchema,
  regular: regularSchema
});

const pathSchema = new mongoose.Schema ({
  title: String,
  thumbnail: thumbnailSchema,
  year: Number,
  category: String,
  rating: String,
  isBookmarked: Boolean,
  isTrending: Boolean,
  userName: String
});

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Path = new mongoose.model("Path", pathSchema);


passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//Read the JSON file
fs.readFile('./public/data.json', "utf-8", function (err, jsonString) {
  if (err) {
    console.log(err);
  } else {
    try {
      jsonFile = JSON.parse(jsonString);
      console.log("JSON read OK");
    } catch (err) {
      console.log("Error parsing JSON ", err);
    }
  }
});

app.get("/", function(req, res){ 
  res.render("login");
  // res.render("ajax", {quote: "AJAX is great!"});
});

app.post("/test", function (req, res) {
  console.log(req.body);
  res.send({response: req.body.quote});
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // res.redirect("/secrets");
    User.find({"secret": {$ne: null}}, function(err, foundUsers){
      if (err){
        console.log(err);
      } else {
        if (foundUsers) {
          res.render("index", {usersWithSecrets: foundUsers});    
        }
      }
    });
  });

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
 res.render("register");
});

// app.get("/secrets", function(req, res){
//   User.find({"secret": {$ne: null}}, function(err, foundUsers){
//     if (err){
//       console.log(err);
//     } else {
//       if (foundUsers) {
//         res.render("secrets", {usersWithSecrets: foundUsers});
//       }
//     }
//   });
// });


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){
  userNameLogin = req.body.username;
  console.log("User name login is " + userNameLogin);

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){

        for (let i = 0; i < jsonFile.length; i++) {
          const newUserPath = new Path({
            title: jsonFile[i].title,
            thumbnail: {
              trending: {
                small: jsonFile[i].thumbnail.trending.small,
                large: jsonFile[i].thumbnail.trending.large,
              },
              regular: {
                small: jsonFile[i].thumbnail.regular.small,
                medium: jsonFile[i].thumbnail.regular.medium,
                large: jsonFile[i].thumbnail.regular.large
              }
            },
            year: jsonFile[i].year,
            category: jsonFile[i].category,
            rating: jsonFile[i].rating,
            isBookmarked: jsonFile[i].isBookmarked,
            isTrending: jsonFile[i].isTrending,
            userName: req.body.username
          });
          newUserPath.save();
          // console.log(jsonFile[i].title);
        }

        User.find({"secret": {$ne: null}}, function(err, foundUsers){
          if (err){
            console.log(err);
          } else {
            if (foundUsers) {
              Path.find(function(err, paths){ 
                if(err){
                    console.log(err);
                } else{ 
                    Path.find({userName: userNameLogin}, function (err, foundPaths) {;
                      res.render("index", {json: foundPaths});
                    });
                   // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                }
              });
            }
          }
        });
      });
    }
  });


});

app.post("/login", function(req, res){
  userNameLogin = req.body.username;

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        // res.redirect("/secrets");
        User.find({"secret": {$ne: null}}, function(err, foundUsers){
          if (err){
            console.log(err);
          } else {
            if (foundUsers) {

              Path.find(function(err, paths){ // This console logs the name of all the paths in the database 
                if(err){
                } else{ // Or you could just show every thing by just console logging paths without the forEach

                  Path.find({userName: userNameLogin}, function (err, foundPaths) {;
                    res.render("index", {json: foundPaths});
                  });
                   // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                }
              });
            }
          }
        });
      });
    }
  });

});

app.post("/bookmarkButton", function(req, res){
  console.log("bookmarkButton");
  console.log(req.body);
  res.send({response: req.body.bookmarkButtonValue});
  const bookMarkValue = req.body.bookmarkButtonValue;

  Path.findOne({title: bookMarkValue, userName: userNameLogin}, function(err, path){
    if(err){
        console.log(err);
    } else{ 
        console.log("Found: " + path.isBookmarked);

        if (path.isBookmarked === true) {

          Path.updateOne({title: bookMarkValue, userName: userNameLogin}, {isBookmarked: false}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                    Path.find({userName: userNameLogin}, function (err, foundPaths) {;
                      res.render("index", {json: foundPaths});
                    });
                     // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                  }
                });
            }
          });
          
        } else {
          Path.updateOne({title: bookMarkValue, userName: userNameLogin}, {isBookmarked: true}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                      // console.log(paths);
                      Path.find({userName: userNameLogin}, function (err, foundPaths) {;
                        res.render("index", {json: foundPaths});
                      });
                     // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                  }
                });
            }
          });
        }
    }
  });
});

app.post("/bookmarkBookmarked", function(req, res){
  const bookMarkValue = req.body.bookmarkButton;
  console.log(bookMarkValue);

  Path.findOne({title: bookMarkValue, userName: userNameLogin}, function(err, path){
    if(err){
        console.log(err);
    } else{ 
        console.log("Found: " + path.isBookmarked);

        if (path.isBookmarked === true) {

          Path.updateOne({title: bookMarkValue, userName: userNameLogin}, {isBookmarked: false}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                    Path.find({userName: userNameLogin}, function (err, foundPaths) {;
                      res.render("bookmarked", {json: foundPaths});
                    });
                     // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                  }
                });
            }
          });
          
        } else {
          Path.updateOne({title: bookMarkValue, userName: userNameLogin}, {isBookmarked: true}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                      // console.log(paths);
                      Path.find({userName: userNameLogin}, function (err, foundPaths) {;
                        res.render("bookmarked", {json: foundPaths});
                      });
                     // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                  }
                });
            }
          });
        }
    }
  });
});

app.post("/index", function(req, res){
  Path.find(function(err, paths){ // This console logs the name of all the paths in the database 
    if(err){
        console.log(err);
    } else{ // Or you could just show every thing by just console logging paths without the forEach
        // console.log(paths);
        Path.find({userName: userNameLogin}, function (err, foundPaths) {;
          res.render("index", {json: foundPaths});
        });
       // mongoose.connection.close(); // It's good practice  to close the database when you're done 
    }
  });
});

app.post("/movies", function(req, res){
  Path.find(function(err, paths){ // This console logs the name of all the paths in the database 
    if(err){
        console.log(err);
    } else{ // Or you could just show every thing by just console logging paths without the forEach
        // console.log(paths);
        Path.find({userName: userNameLogin}, function (err, foundPaths) {;
          res.render("movies", {json: foundPaths});
        });
       // mongoose.connection.close(); // It's good practice  to close the database when you're done 
    }
  });
});

app.post("/tv", function(req, res){
  Path.find(function(err, paths){ // This console logs the name of all the paths in the database 
    if(err){
        console.log(err);
    } else{ // Or you could just show every thing by just console logging paths without the forEach
        // console.log(paths);
        Path.find({userName: userNameLogin}, function (err, foundPaths) {;
          res.render("tv", {json: foundPaths});
        });
       // mongoose.connection.close(); // It's good practice  to close the database when you're done 
    }
  });
});

app.post("/bookmarked", function(req, res){
  Path.find(function(err, paths){ // This console logs the name of all the paths in the database 
    if(err){
        console.log(err);
    } else{ // Or you could just show every thing by just console logging paths without the forEach
        // console.log(paths);
        Path.find({userName: userNameLogin}, function (err, foundPaths) {;
          res.render("bookmarked", {json: foundPaths});
        });
       // mongoose.connection.close(); // It's good practice  to close the database when you're done 
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});

