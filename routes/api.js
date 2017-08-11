const router = require("express").Router();
const controllers = require("../controllers");

let controller;
let searchType;

router.all("/:resource/:id?", (req, res) => {
	controller = controllers[req.params.resource];

	if (controller === undefined) {
		return res.json({
			confirmation: "fail",
			resource: "invalid resource"
		});
	}
	// returns the method
	determineMethod(req)(req, res);
});

function determineMethod(req) {
	if (req.params.id === undefined) {
		if (req.method === "GET") {
			return controller.index;
		} else {
			return controller.create;
		}
	}

	if (req.method === "GET") {
		switch (req.params.id) {
			case "cart":
				return controller.viewCart;
			default:
				return;
		}

		return controller.view;
	}

	if (req.method === "POST") {
		switch (req.params.id) {
			case "cart":
				return controller.addToCart;

			case "search":
				return controller.search;

			case "sort":
				return controller.sort;

			case "filter":
				return controller.filter;

			default:
				return;
		}
	}

	if (req.method === "PUT") {
		return controller.update;
	}

	if (req.method === "DELETE") {
		return controller.remove;
	}

	return undefined;
}

module.exports = router;
