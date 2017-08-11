const ModelWrapper = require("./model-wrapper");
const MODEL_USER = "User";
const MODEL_PRODUCT = "Product";
const MODEL_ORDER = "Order";
const MODEL_CATEGORY = "Category";

const ORM_SEQUELIZE = "sequelize";

class SequelizeWrapper extends ModelWrapper {
	constructor(db) {
		super(db);
		this.type = ORM_SEQUELIZE;
	}

	/******************************
   * USERS
   */
	findAllUsers(options) {
		return this.findAll(MODEL_USER, options);
	}

	findUserById(id) {
		return this.findById(MODEL_USER, id);
	}

	createNewUser(params) {
		return this.create(MODEL_USER, params);
	}

	/******************************
   * PRODUCTS
   */
	findAllProducts(options) {
		return this.findAll(MODEL_PRODUCT, options);
	}

	findAllProductsAndGroup(groupNum, options) {
		return this.findAllProducts(options).then(rawProducts => {
			let products = [];
			let count = 0;

			rawProducts.forEach((product, i) => {
				if (!Array.isArray(products[count])) {
					products[count] = [];
				}
				products[count][i % groupNum] = product;
				if (i % groupNum === groupNum - 1) {
					count++;
				}
			});

			return products;
		});
	}

	findProductById(id) {
		return this.findById(MODEL_PRODUCT, id);
	}

	/******************************
   * CATEGORY
   */
	findAllCategories(options) {
		return this.findAll(MODEL_CATEGORY, options);
	}

	findCategoryById(id) {
		return this.findById(MODEL_CATEGORY, id);
	}
}

module.exports = SequelizeWrapper;
