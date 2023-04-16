const fs = require("fs");
let json =[];
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

app.use(passport.initialize());
app.use(passport.session());

//Setting up the users data base inside userDB
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
// mongoose.connect("mongodb+srv://SmileAndWaveBoyz:Newcross971@cluster0.o6lompz.mongodb.net/userDB", {useNewUrlParser: true});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

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
  isTrending: Boolean
});

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
      json = JSON.parse(jsonString);
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

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        User.find({"secret": {$ne: null}}, function(err, foundUsers){
          if (err){
            console.log(err);
          } else {
            if (foundUsers) {

              Path.find(function(err, paths){ // This console logs the name of all the paths in the database 
                if(err){
                    console.log(err);
                } else{ // Or you could just show every thing by just console logging paths without the forEach
                    console.log(paths);
                    res.render("index", {json: paths});
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
                    res.render("index", {json: paths});
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

  Path.findOne({title: bookMarkValue}, function(err, path){
    if(err){
        console.log(err);
    } else{ 
        console.log("Found: " + path.isBookmarked);

        if (path.isBookmarked === true) {

          Path.updateOne({title: bookMarkValue}, {isBookmarked: false}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                      res.render("index", {json: paths});
                     // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                  }
                });
            }
          });
          
        } else {
          Path.updateOne({title: bookMarkValue}, {isBookmarked: true}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                      // console.log(paths);
                      res.render("index", {json: paths});
                     // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                  }
                });
            }
          });
        }
    }
  });
});

app.post("/bookmarkButtonMovies", function(req, res){
  const bookMarkValue = req.body.bookmarkButton;
  console.log(bookMarkValue);

  Path.findOne({title: bookMarkValue}, function(err, path){
    if(err){
        console.log(err);
    } else{ 
        console.log("Found: " + path.isBookmarked);

        if (path.isBookmarked === true) {

          Path.updateOne({title: bookMarkValue}, {isBookmarked: false}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                      res.render("movies", {json: paths});
                     // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                  }
                });
            }
          });
          
        } else {
          Path.updateOne({title: bookMarkValue}, {isBookmarked: true}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                      // console.log(paths);
                      res.render("movies", {json: paths});
                     // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                  }
                });
            }
          });
        }
    }
  });
});

app.post("/bookmarkTV", function(req, res){
  const bookMarkValue = req.body.bookmarkButton;
  console.log(bookMarkValue);

  Path.findOne({title: bookMarkValue}, function(err, path){
    if(err){
        console.log(err);
    } else{ 
        console.log("Found: " + path.isBookmarked);

        if (path.isBookmarked === true) {

          Path.updateOne({title: bookMarkValue}, {isBookmarked: false}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                      res.render("tv", {json: paths});
                     // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                  }
                });
            }
          });
          
        } else {
          Path.updateOne({title: bookMarkValue}, {isBookmarked: true}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                      // console.log(paths);
                      res.render("tv", {json: paths});
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

  Path.findOne({title: bookMarkValue}, function(err, path){
    if(err){
        console.log(err);
    } else{ 
        console.log("Found: " + path.isBookmarked);

        if (path.isBookmarked === true) {

          Path.updateOne({title: bookMarkValue}, {isBookmarked: false}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                      res.render("bookmarked", {json: paths});
                     // mongoose.connection.close(); // It's good practice  to close the database when you're done 
                  }
                });
            }
          });
          
        } else {
          Path.updateOne({title: bookMarkValue}, {isBookmarked: true}, function(err){
            if(err){
                console.log(err);
            } else{
                console.log("Successfully updated the document.");

                Path.find(function(err, paths){
                  if(err){
                      console.log(err);
                  } else{ 
                      // console.log(paths);
                      res.render("bookmarked", {json: paths});
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
        console.log(paths);
        res.render("index", {json: paths});
       // mongoose.connection.close(); // It's good practice  to close the database when you're done 
    }
  });
});

app.post("/movies", function(req, res){
  Path.find(function(err, paths){ // This console logs the name of all the paths in the database 
    if(err){
        console.log(err);
    } else{ // Or you could just show every thing by just console logging paths without the forEach
        console.log(paths);
        res.render("movies", {json: paths});
       // mongoose.connection.close(); // It's good practice  to close the database when you're done 
    }
  });
});

app.post("/tv", function(req, res){
  Path.find(function(err, paths){ // This console logs the name of all the paths in the database 
    if(err){
        console.log(err);
    } else{ // Or you could just show every thing by just console logging paths without the forEach
        console.log(paths);
        res.render("tv", {json: paths});
       // mongoose.connection.close(); // It's good practice  to close the database when you're done 
    }
  });
});

app.post("/bookmarked", function(req, res){
  Path.find(function(err, paths){ // This console logs the name of all the paths in the database 
    if(err){
        console.log(err);
    } else{ // Or you could just show every thing by just console logging paths without the forEach
        console.log(paths);
        res.render("bookmarked", {json: paths});
       // mongoose.connection.close(); // It's good practice  to close the database when you're done 
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});

