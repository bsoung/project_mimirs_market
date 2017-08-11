// config/sequelize.js
if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}
module.exports = {
	development: {
		username: process.env.DBUSER,
		password: process.env.DBPASS,
		database: "mimir_market",
		host: "127.0.0.1",
		dialect: "postgres"
	},
	test: {
		username: process.env.DBUSER,
		password: process.env.DBPASS,
		database: "mimir_market_test",
		host: "127.0.0.1",
		dialect: "postgres"
	},
	production: {
		use_env_variable: "POSTGRES_URL",
		dialect: "postgres"
	}
};
