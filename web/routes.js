var router = require("express").Router();
var settings = require('../settings');

router.get("/", function(req, res, next) {
  res.redirect("/play");
});

router.get("/play", function(req, res, next) {
  res.render("play");
});

router.get("/show", function(req, res, next) {
  res.render("show", {
    host: settings.server.host
  });
});

module.exports = router;