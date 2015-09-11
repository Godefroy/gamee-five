var router = require("express").Router();

router.get("/", function(req, res, next) {
	res.redirect("/play");
});

router.get("/play", function(req, res, next) {
	res.render("play");
});

router.get("/show", function(req, res, next) {
	res.render("show");
});

module.exports = router;