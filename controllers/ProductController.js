const getModelWrapper = require("../models/index");
const wrapper = getModelWrapper();
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
	index: function(req, res) {
		// if (req.session["products"] === undefined) {
		// 	req.session["products"] = [];
		// }

		Promise.all([
			wrapper.findAllProductsAndGroup(3, { limit: 10 }),
			wrapper.findAllCategories()
		])
			.then(_renderProductsIndex)
			.catch(err => {
				return res.json({
					confirmation: "fail",
					error: err.message
				});
			});

		function _renderProductsIndex(data) {
			let [products, categories] = data;
			let cartData = req.session.products;

			return res.render("products/index", { products, categories, cartData });
		}
	},

	/**
   * ProductController.view()
   */
	view: function(req, res) {
		const wrapper = getModelWrapper();
		const id = req.params.id;

		Promise.all([wrapper.findProductById(id), wrapper.findAllCategories()])
			.then(_renderProductView)
			.catch(err => console.error(err));

		function _renderProductView(data) {
			let [product, categories] = data;
			let cartData = req.session.products;

			return res.render("products/view", { product, cartData, categories });
		}
	},

	/**
   * ProductController.create()
   */
	create: function(req, res) {
		var Product = new ProductModel({
			name: req.body.name,
			sku: req.body.sku,
			desc: req.body.desc,
			price: req.body.price,
			categoryId: req.body.categoryId
		});

		Product.save(function(err, Product) {
			if (err) {
				return res.status(500).json({
					message: "Error when creating Product",
					error: err
				});
			}
			return res.status(201).json(Product);
		});
	},

	/**
   * ProductController.update()
   */
	update: function(req, res) {
		var id = req.params.id;
		ProductModel.findOne({ _id: id }, function(err, Product) {
			if (err) {
				return res.status(500).json({
					message: "Error when getting Product",
					error: err
				});
			}
			if (!Product) {
				return res.status(404).json({
					message: "No such Product"
				});
			}

			Product.name = req.body.name ? req.body.name : Product.name;
			Product.sku = req.body.sku ? req.body.sku : Product.sku;
			Product.desc = req.body.desc ? req.body.desc : Product.desc;
			Product.price = req.body.price ? req.body.price : Product.price;
			Product.categoryId = req.body.categoryId
				? req.body.categoryId
				: Product.categoryId;

			Product.save(function(err, Product) {
				if (err) {
					return res.status(500).json({
						message: "Error when updating Product.",
						error: err
					});
				}

				return res.json(Product);
			});
		});
	},

	addToCart: function(req, res) {
		console.log("HFEJLWLKWEJFLEJ");
		if (req.session["products"] === undefined) {
			req.session["products"] = [];
		}

		const id = req.body.productId;

		// loop thru and remove duplicates and increment count if same order placed
		// let index =

		// if (index !== -1) {
		// 	let copy = Object.assign({}, req.session.products[index]);
		// 	copy.count += 1;
		// 	req.session.products.push(copy);
		// 	console.log(req.session.products, "????");
		// 	return res.redirect("/products");
		// }

		let options = {
			where: {
				id: id
			}
		};

		let item = {};

		wrapper
			.findAllProducts(options)
			.then(products => {
				item["name"] = products[0]["name"];
				item["img"] = products[0]["img"];
				item["price"] = products[0]["price"];
				item["productId"] = products[0]["id"];
				item["count"] = 1;

				options["productId"] = item["productId"];

				return wrapper.findAllCategories(options);
			})
			.then(categories => {
				item["categoryName"] = categories[0]["name"];

				let index = req.session.products.findIndex(
					p => p.productId === options.productId
				);

				if (index === -1) {
					req.session.products.push(item);
				} else {
					req.session.products[index].count += 1;
				}

				console.log(req.session.products);

				return res.redirect("/products");
			});
	},

	viewCart: function(req, res) {
		let cartData = req.session.products;
		let total;
		let sum = 0;

		wrapper.findAllCategories().then(categories => {
			cartData.forEach(product => {
				sum += parseFloat(product.price);
			});

			req.session["totalCost"] = { amount: sum.toFixed(2) };
			total = req.session.totalCost;

			res.render("cart/index", { cartData, categories, total });
		});

		// var result = parseFloat('2.3') + parseFloat('2.4');
		// alert(result.toFixed(2));​
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
			let [products, categories] = data;

			if (!products.length) {
				res.end("No products found");
				return;
			}

			return res.render("products/index", { products, categories });
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

		navUtils.processSearch(type, _renderSortResults, wrapper);

		function _renderSortResults(data) {
			let [products, categories] = data;

			return res.render("products/index", { products, categories });
		}
	},

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
					let [products] = data;

					return res.render("products/index", { products, categories });
				})
				.catch(err => console.error(err));
		}
	}
};
