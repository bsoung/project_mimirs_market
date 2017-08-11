const ModelWrapper = require("./model-wrapper");
const MODEL_USER = "User";
const MODEL_PRODUCT = "Product";
const MODEL_ORDER = "Order";
const MODEL_CHARGE = "Charge";

const ODM_MONGOOSE = "mongoose";

class MongooseWrapper extends ModelWrapper {
	constructor(db) {
		super(db);
		this.type = ODM_MONGOOSE;
	}

	/******************************
   * ORDERS
   */

	findOrderById(id) {
		return this.findById(MODEL_ORDER, id);
	}

	createNewOrder(params) {
		return this.create(MODEL_ORDER, params);
	}

	saveNewOrder(params) {
		return this.save(MODEL_ORDER, params);
	}

	/******************************
   * ORDERS
   */

	createNewCharge(params) {
		return this.create(MODEL_CHARGE, params);
	}
}

module.exports = MongooseWrapper;
