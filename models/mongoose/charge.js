var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ChargeSchema = new Schema({
	chargeId: String,
	sourceId: String,
	amount: Number,
	createdAt: Date,
	description: String,
	user: [
		{
			fname: String,
			lname: String,
			email: String,
			address: String,
			city: String,
			state: String,
			zipcode: Number
		}
	],
	cart: [
		{
			quantity: Number,
			totalPrice: Number,
			product: {
				name: String,
				price: Number,
				productId: String,
				categoryId: String
			}
		}
	]
});

module.exports = mongoose.model("Charge", ChargeSchema);
