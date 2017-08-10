const router = require("express").Router();
const controllers = require("../controllers");

let controller;
let searchType;

router.all("/:resource/:id?", (req, res) => {
	controller = controllers[req.params.resource];
	if (controller === undefined) {
		res.json({
			confirmation: "fail",
			resource: "invalid resource"
		});
		return;
	}
	// returns the method
	determineMethod(req)(req, res);
});

router.post("/:resource/type/:searchType", (req, res) => {
	const types = {
		search: "search",
		filter: "filter",
		sort: "sort"
	};

	controller = controllers[req.params.resource];
	searchType = types[req.params.searchType];

	if (controller === undefined || searchType === undefined) {
		res.json({
			confirmation: "fail",
			error: "invalid resource or search type"
		});
		return;
	}

	determineSearch(searchType)(req, res);
});

function determineSearch(searchType) {
	switch (searchType) {
		case "search":
			return controller.search;
			break;

		case "sort":
			return controller.sort;
			break;

		case "filter":
			return controller.filter;
			break;

		default:
			return undefined;
	}
}

function determineMethod(req) {
	if (req.params.id === undefined) {
		if (req.method === "GET") {
			return controller.index;
		} else {
			return controller.create;
		}
	} else {
		if (req.method === "GET") {
			return controller.view;
		}

		if (req.method === "PUT") {
			return controller.update;
		}

		if (req.method === "DELETE") {
			return controller.remove;
		}
	}

	return undefined;
}

module.exports = router;
