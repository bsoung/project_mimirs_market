var OrderModel = require("../models/mongoose/order.js");
const getModelWrapper = require("../models/index");

const { STRIPE_SK, STRIPE_PK } = process.env;

const stripe = require("stripe")(STRIPE_SK);

/**
 * OrderController.js
 *
 * @description :: Server-side logic for managing Orders.
 */
module.exports = {
	/**
   * OrderController.index()
   */
	index: function(req, res) {
		OrderModel.find(function(err, Orders) {
			if (err) {
				return res.status(500).json({
					message: "Error when getting Order.",
					error: err
				});
			}
			return res.json(Orders);
		});
	},

	/**
   * OrderController.view()
   */
	view: async function(req, res) {
		const wrapper = getModelWrapper("mongoose");
		const id = req.params.id;
		const { products } = req.session;

		let order = await wrapper.findOrderById(req.params.id);

		return res.render("checkout/index", {
			layout: "main-checkout",
			products: products,
			order: order
		});
	},

	/**
   * OrderController.create()
   */
	create: async function(req, res) {
		if (req.session["currentOrderId"]) {
			return res.redirect(`/orders/${req.session.currentOrderId}`);
		}

		const wrapper = getModelWrapper("mongoose");
		const total = parseFloat(req.body.total);
		let { products } = req.session;

		if (!products.length) {
			return res.end("empty cart placeholder!");
		}

		let params = {
			itemCount: products.length,
			totalCost: total.toFixed(2),
			userId: 1
		};

		let order = await wrapper.createNewOrder(params);

		let id = order._id;
		req.session["currentOrderId"] = id;
		return res.redirect(`/orders/${id}`);
	},

	/**
   * OrderController.update()
   */
	update: function(req, res) {
		// var id = req.params.id;
		// OrderModel.findOne({ _id: id }, function(err, Order) {
		// 	if (err) {
		// 		return res.status(500).json({
		// 			message: "Error when getting Order",
		// 			error: err
		// 		});
		// 	}
		// 	if (!Order) {
		// 		return res.status(404).json({
		// 			message: "No such Order"
		// 		});
		// 	}
		// 	Order.itemCount = req.body.itemCount
		// 		? req.body.itemCount
		// 		: Order.itemCount;
		// 	Order.totalCost = req.body.totalCost
		// 		? req.body.totalCost
		// 		: Order.totalCost;
		// 	Order.userId = req.body.userId ? req.body.userId : Order.userId;
		// 	Order.save(function(err, Order) {
		// 		if (err) {
		// 			return res.status(500).json({
		// 				message: "Error when updating Order.",
		// 				error: err
		// 			});
		// 		}
		// 		return res.json(Order);
		// 	});
		// });
	},

	/**
   * OrderController.remove()
   */
	remove: function(req, res) {
		var id = req.params.id;
		OrderModel.findByIdAndRemove(id, function(err, Order) {
			if (err) {
				return res.status(500).json({
					message: "Error when deleting the Order.",
					error: err
				});
			}
			return res.status(204).json();
		});
	},

	charge: async function(req, res) {
		let wrapper = getModelWrapper("mongoose");
		let {
			charNumber,
			charCode,
			month,
			year,
			emailAddress,
			firstName,
			lastName,
			address,
			city,
			state,
			zipcode
		} = req.body;

		zipcode = parseInt(zipcode);

		let { products, currentOrderId, name, price } = req.session;
		let id = currentOrderId;

		let order = await wrapper.findOrderById(id);
		let roundedOrder = Math.round(order.totalCost * 100);

		if (order !== null) {
			let charge = await stripe.charges.create({
				amount: roundedOrder,
				currency: "usd",
				description: `charge for ${emailAddress}`,
				source: "tok_visa"
			});

			let chargeObj = {
				chargeId: charge.id,
				sourceId: charge.source.id,
				amount: charge.amount,
				createdAt: charge.created,
				description: charge.description,
				user: [
					{
						fname: "firstName",
						lname: "lastName",
						email: emailAddress,
						address: "address",
						city: "city",
						state: "state",
						zipcode: 98004
					}
				],
				cart: [
					{
						quantity: order.itemCount,
						totalPrice: order.totalCost,
						product: {
							name: name,
							price: price
						}
					}
				]
			};

			await wrapper.createNewCharge(chargeObj);
			// data from cart and checkout

			// save shit to mongodb

			res.redirect("/orders/success");
		}
	},

	viewSuccess: function(req, res) {
		res.render("confirmation/index");
	}
};
