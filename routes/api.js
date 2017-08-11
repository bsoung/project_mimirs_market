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
		}

		return controller.create;
	}

	if (req.method === "GET") {
		const getMap = {
			cart: controller.viewCart
		};

		return getMap[req.params.id] ? getMap[req.params.id] : controller.view;
	}

	if (req.method === "POST") {
		const postMap = {
			cart: controller.addToCart,
			search: controller.search,
			sort: controller.sort,
			filter: controller.filter
		};

		return postMap[req.params.id] ? postMap[req.params.id] : undefined;
	}

	if (req.method === "PUT") {
		const updateMap = {
			cart: controller.updateCart
		};

		return updateMap[req.params.id]
			? updateMap[req.params.id]
			: controller.update;
	}

	if (req.method === "DELETE") {
		const deleteMap = {
			cart: controller.removeFromCart
		};

		return deleteMap[req.params.id]
			? deleteMap[req.params.id]
			: controller.remove;
	}

	return undefined;
}

module.exports = router;
