"use strict";
const faker = require("faker");
module.exports = {
	up: function(queryInterface, Sequelize) {
		let categories = [
			"abstract",
			"animals",
			"business",
			"cats",
			"city",
			"food",
			"nightlife",
			"fashion",
			"people",
			"nature",
			"sports",
			"technics",
			"transport"
		];

		const products = [];

		for (let a = 0; a < categories.length; a++) {
			for (let i = 0; i < 3; i++) {
				products.push({
					name: faker.random.words(3),
					img: faker.image[categories[a]](),
					sku: faker.random.number(1000000, 10000000),
					desc: faker.lorem.words(25),
					price: faker.finance.amount(3),
					categoryId: a + 1
				});
			}
		}

		return queryInterface.bulkInsert("Products", products);
	},

	down: function(queryInterface, Sequelize) {
		return queryInterface.bulkDelete("Products", null, {}, Sequelize.Product);
	}
};
