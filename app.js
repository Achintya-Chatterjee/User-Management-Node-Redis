const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const redis = require("redis");
const { create } = require("express-handlebars");

//creating redis client
let client = redis.createClient();
client.on("connect", function () {
  console.log("connected to Redis...");
});

// Set Port
const port = process.env.PORT || 3000;
const REDIS_PORT = process.env.PORT || 6379;

// Init app
const app = express();

// View Engine\
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// methodOverride
app.use(methodOverride("_method"));
//search page
app.get("/", function (req, res, next) {
  res.render("searchusers");
});
//search processing
app.post("/user/search", function (req, res, next) {
  let id = req.body.id;

  client.hgetall(id, function (err, obj) {
    if (!obj) {
      res.render("searchusers", {
        error: "users does not exist!!",
      });
    } else {
      obj.id = id;
      res.render("details", {
        user: obj,
      });
    }
  });
});
// add user page
app.get("/user/add", function (req, res, next) {
  res.render("adduser");
});
// process add user page
app.post("/user/add", function (req, res, next) {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let phone = req.body.phone;
  let email = req.body.email;

  client.hmset(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "phone",
      phone,
      "email",
      email,
    ],
    function (err, reply) {
      if (err) {
        console.log(err);
      }
      console.log(reply);
      res.redirect("/");
    }
  );
});

//Delete user
app.delete("/user/delete/:id", function (req, res, next) {
  client.del(req.params.id);
  res.redirect("/");
});

app.listen(port, function () {
  console.log("Server started on port " + port);
});
