const getModelWrapper = require("../models/index");
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
		const wrapper = getModelWrapper();

		Promise.all([
			wrapper.findAllProductsAndGroup(3, { limit: 10 }),
			wrapper.findAllCategories()
		])
			.then(_renderProductsIndex)
			.catch(err => console.error(err));

		function _renderProductsIndex(data) {
			let [products, categories] = data;

			res.render("products/index", { products, categories });
		}
	},

	/**
   * ProductController.view()
   */
	view: function(req, res) {
		// TODO
		const wrapper = getModelWrapper();
		const id = req.params.id;

		Promise.all([wrapper.findProductById(id)])
			.then(_renderProductView)
			.catch(err => console.error(err));

		function _renderProductView(data) {
			let [product] = data;

			res.render("products/view", { product });
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
		const wrapper = getModelWrapper();

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

			res.render("products/index", { products, categories });
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

		const wrapper = getModelWrapper();
		const sortMethod = req.body.refine.sort;

		let type = sortMap[sortMethod];

		navUtils.processSearch(type, _renderSortResults, wrapper);

		function _renderSortResults(data) {
			let [products, categories] = data;

			res.render("products/index", { products, categories });
		}
	},

	filter: function(req, res) {
		const wrapper = getModelWrapper();

		let { productQuery, categoriesQuery } = navUtils.buildQuery(req);

		Promise.all([
			wrapper.findAllProductsAndGroup(3, productQuery),
			wrapper.findAllCategories(categoriesQuery)
		])
			.then(_renderFilteredResults)
			.catch(err => console.error(err));

		function _renderFilteredResults(data) {
			// reset our categories to full
			const wrapper = getModelWrapper();
			wrapper
				.findAllCategories()
				.then(categories => {
					let [products] = data;

					res.render("products/index", { products, categories });
				})
				.catch(err => console.error(err));
		}
	}
};
