const router = require("./api");

router.get("/", (req, res) => {
	return res.render("landing", {
		layout: "main-no-nav"
	});
});

module.exports = router;
