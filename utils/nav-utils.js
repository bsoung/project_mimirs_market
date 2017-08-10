const Promise = require("bluebird");

module.exports = {
	buildQuery: function(req) {
		let filterMap = {
			minPrices: {
				1: 5,
				2: 50,
				3: 100,
				4: 300,
				5: 500
			},
			maxPrices: {
				1: 50,
				2: 100,
				3: 300,
				4: 500,
				5: 1000
			}
		};

		let productOpts = {};
		let categoryOpts = {};

		if (req.body.minPrice === "0" && req.body.maxPrice !== "0") {
			productOpts = {
				where: {
					price: {
						$lte: filterMap.maxPrices[req.body.maxPrice]
					}
				},
				order: [["price", "ASC"]]
			};
		} else if (req.body.maxPrice === "0" && req.body.minPrice !== "0") {
			productOpts = {
				where: {
					price: {
						$gte: filterMap.minPrices[req.body.minPrice]
					}
				},
				order: [["price", "ASC"]]
			};
		} else if (req.body.maxPrice !== "0" && req.body.minPrice !== "0") {
			productOpts = {
				where: {
					price: {
						$and: {
							$gte: filterMap.minPrices[req.body.minPrice],
							$lte: filterMap.maxPrices[req.body.maxPrice]
						}
					}
				},
				order: [["price", "ASC"]]
			};
		}

		if (req.body.categoryId !== "0") {
			categoryOpts = {
				where: {
					id: {
						$eq: req.body.categoryId
					}
				},
				order: [["name", "ASC"]]
			};
		}

		return {
			productQuery: productOpts,
			categoriesQuery: categoryOpts
		};
	},

	processSearch: function(searchType, callback, wrapper) {
		switch (searchType) {
			case "Name Ascending":
				Promise.all([
					wrapper.findAllProductsAndGroup(3, {
						order: [["name", "ASC"]]
					}),
					wrapper.findAllCategories()
				])
					.then(callback)
					.catch(err => console.error(err));
				break;

			case "Price Ascending":
				Promise.all([
					wrapper.findAllProductsAndGroup(3, {
						order: [["price", "ASC"]]
					}),
					wrapper.findAllCategories()
				])
					.then(callback)
					.catch(err => console.error(err));
				break;

			case "Price Descending":
				Promise.all([
					wrapper.findAllProductsAndGroup(3, {
						order: [["price", "DESC"]]
					}),
					wrapper.findAllCategories()
				])
					.then(callback)
					.catch(err => console.error(err));
				break;

			case "Newest First":
				Promise.all([
					wrapper.findAllProductsAndGroup(3, {
						order: [["createdAt", "ASC"]]
					}),
					wrapper.findAllCategories()
				])
					.then(callback)
					.catch(err => console.error(err));
				break;

			case "Oldest First":
				Promise.all([
					wrapper.findAllProductsAndGroup(3, {
						order: [["createdAt", "DESC"]]
					}),
					wrapper.findAllCategories()
				])
					.then(callback)
					.catch(err => console.error(err));
				break;

			default:
				res.render("/");
				return;
		}
	}
};
