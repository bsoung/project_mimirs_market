const getModelWrapper = require("../models/index");
const wrapper = getModelWrapper(); // default sequelize wrapper
const { navUtils } = require("../utils");

/**
 * ProductController.js
 *
 * @description :: Server-side logic for managing Products.
 */
module.exports = {
	/**
   * ProductController.index()
   */
	index: async function(req, res) {
		let products = await wrapper.findAllProductsAndGroup(3);
		let categories = await wrapper.findAllCategories();

		let categoryProducts = [];
		let cartData = req.session.products;

		products.forEach(productGroup => {
			productGroup = productGroup.map(product => {
				let index = categories.findIndex(c => c.id === product.categoryId);
				let category = categories[index].name;
				product.dataValues["category"] = category;
				return product;
			});

			categoryProducts.push(productGroup);
		});

		return res.render("products/index", {
			categoryProducts,
			categories,
			cartData
		});
	},

	/**
   * ProductController.view()
   */
	view: async function(req, res) {
		const id = req.params.id;
		let product = await wrapper.findProductById(id);
		let categories = await wrapper.findAllCategories();

		let categoryProducts = [];
		let cartData = req.session.products;

		let index = categories.findIndex(c => c.id === product.categoryId);
		let category = categories[index].name;
		product.dataValues["category"] = category;

		return res.render("products/view", { product, cartData, categories });
	},

	/**
   * ProductController.create()
   */
	create: function(req, res) {
		// var Product = new ProductModel({
		// 	name: req.body.name,
		// 	sku: req.body.sku,
		// 	desc: req.body.desc,
		// 	price: req.body.price,
		// 	categoryId: req.body.categoryId
		// });
		// Product.save(function(err, Product) {
		// 	if (err) {
		// 		return res.status(500).json({
		// 			message: "Error when creating Product",
		// 			error: err
		// 		});
		// 	}
		// 	return res.status(201).json(Product);
		// });
	},

	/**
   * ProductController.update()
   */
	update: function(req, res) {
		// wrapper.findProductById(req.params.id).then(product => {
		// 	if (!product) {
		// 		return res.status(404).json({
		// 			message: "No such product"
		// 		});
		// 	}
		// 	console.log(product, "what is this?");
		// 	res.end("update");
		// });
		// ProductModel.findOne({ _id: id }, function(err, Product) {
		// 	if (err) {
		// 		return res.status(500).json({
		// 			message: "Error when getting Product",
		// 			error: err
		// 		});
		// 	}
		// 	if (!Product) {
		// 		return res.status(404).json({
		// 			message: "No such Product"
		// 		});
		// 	}
		// 	Product.name = req.body.name ? req.body.name : Product.name;
		// 	Product.sku = req.body.sku ? req.body.sku : Product.sku;
		// 	Product.desc = req.body.desc ? req.body.desc : Product.desc;
		// 	Product.price = req.body.price ? req.body.price : Product.price;
		// 	Product.categoryId = req.body.categoryId
		// 		? req.body.categoryId
		// 		: Product.categoryId;
		// 	Product.save(function(err, Product) {
		// 		if (err) {
		// 			return res.status(500).json({
		// 				message: "Error when updating Product.",
		// 				error: err
		// 			});
		// 		}
		// 		return res.json(Product);
		// 	});
		// });
	},

	removeFromCart: function(req, res) {
		const id = parseInt(req.body.id);
		let { products } = req.session;

		const index = products.findIndex(p => p.productId === id);

		if (index === -1) {
			return res.end("could not find item placeholder");
		}

		products = products.splice(index, 1);

		return res.redirect("back");
	},

	updateCart: function(req, res) {
		const id = parseInt(req.body.id);
		const { products } = req.session;

		const index = products.findIndex(p => p.productId === id);
		req.session.products[index].count = req.body.quantity;

		return res.redirect("back");
	},

	addToCart: async function(req, res) {
		if (req.session["products"] === undefined) {
			req.session["products"] = [];
		}

		let obj = {};
		let item = {};

		const prodOptions = {
			where: {
				id: req.body.productId
			}
		};

		let products = await wrapper.findAllProducts(prodOptions);

		const attributes = ["name", "img", "price", "categoryId"];
		attributes.forEach(attr => {
			item[attr] = products[0][attr];
		});

		const catOptions = {
			where: {
				id: item.categoryId
			}
		};

		item["count"] = 1;
		item["productId"] = products[0]["id"];

		let categories = await wrapper.findAllCategories(catOptions);

		item["categoryName"] = categories[0]["name"];

		let index = req.session.products.findIndex(
			p => p.productId === item.productId
		);

		if (index === -1) {
			req.session.products.push(item);
		} else {
			req.session.products[index].count += 1;
		}

		return res.redirect("/products");
	},

	viewCart: async function(req, res) {
		if (req.session["products"] === undefined) {
			req.session["products"] = [];
		}

		let cartData = req.session.products;
		let total;
		let sum = 0;

		let categories = await wrapper.findAllCategories();

		cartData.forEach(product => {
			sum += parseFloat(product.price) * product.count;
		});

		req.session["totalCost"] = { amount: sum.toFixed(2) };
		total = req.session.totalCost;

		return res.render("cart/index", { cartData, categories, total });
	},

	/**
   * ProductController.remove()
   */
	remove: function(req, res) {
		var id = req.params.id;

		ProductModel.findByIdAndRemove(id, function(err, Product) {
			if (err) {
				return res.status(500).json({
					message: "Error when deleting the Product.",
					error: err
				});
			}
			return res.status(204).json();
		});
	},

	/**
   * Search 
   */
	search: function(req, res) {
		Promise.all([
			wrapper.findAllProductsAndGroup(3, {
				where: {
					$or: {
						name: { $ilike: `%${req.body.term}%` },
						desc: { $ilike: `%${req.body.term}%` }
					}
				}
			}),
			wrapper.findAllCategories()
		])
			.then(_renderSearchResults)
			.catch(err => console.error(err));

		function _renderSearchResults(data) {
			let categoryProducts = [];
			let [products, categories] = data;

			if (!products.length) {
				res.end("No products found");
				return;
			}

			products.forEach(productGroup => {
				productGroup = productGroup.map(product => {
					let index = categories.findIndex(c => c.id === product.categoryId);
					let category = categories[index].name;
					product.dataValues["category"] = category;
					return product;
				});

				categoryProducts.push(productGroup);
			});

			return res.render("products/index", { categoryProducts, categories });
		}
	},

	sort: function(req, res) {
		const sortMap = {
			1: "Name Ascending",
			2: "Price Ascending",
			3: "Price Descending",
			4: "Newest First",
			5: "Oldest First"
		};

		const sortMethod = req.body.refine.sort;

		let type = sortMap[sortMethod];

		navUtils.processSearch(res, type, _renderSortResults, wrapper);

		function _renderSortResults(data) {
			let categoryProducts = [];
			let [products, categories] = data;

			products.forEach(productGroup => {
				productGroup = productGroup.map(product => {
					let index = categories.findIndex(c => c.id === product.categoryId);
					let category = categories[index].name;
					product.dataValues["category"] = category;
					return product;
				});

				categoryProducts.push(productGroup);
			});

			return res.render("products/index", { categoryProducts, categories });
		}
	},
	// TODO: FILTER HALF BROKE - category searching
	filter: function(req, res) {
		let { productQuery, categoriesQuery } = navUtils.buildQuery(req);

		Promise.all([
			wrapper.findAllProductsAndGroup(3, productQuery),
			wrapper.findAllCategories(categoriesQuery)
		])
			.then(_renderFilteredResults)
			.catch(err => console.error(err));

		function _renderFilteredResults(data) {
			// reset our categories to full
			wrapper
				.findAllCategories()
				.then(categories => {
					let categoryProducts = [];
					let [products] = data;

					products.forEach(productGroup => {
						productGroup = productGroup.map(product => {
							let index = categories.findIndex(
								c => c.id === product.categoryId
							);
							let category = categories[index].name;
							product.dataValues["category"] = category;
							return product;
						});

						categoryProducts.push(productGroup);
					});

					return res.render("products/index", { categoryProducts, categories });
				})
				.catch(err => console.error(err));
		}
	}
};

async function read() {
	var md = hget(html, {
		markdown: true,
		root: "main",
		ignore: ".at-subscribe,.mm-comments,.de-sidebar"
	});
	var txt = marked(md, {
		renderer: new Term()
	});
	console.log(txt);
}
