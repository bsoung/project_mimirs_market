const DB_MAP = {
	sequelize: {
		findAll: "findAll",
		findById: "findById",
		create: "create"
	},
	mongoose: {
		findAll: "find",
		findById: "findById"
	}
};

class ModelWrapper {
	constructor(db) {
		this.db = db;
	}

	findAll(model, query, options) {
		return this.db[model][DB_MAP[this.type]["findAll"]](query);
	}

	findById(model, id, options) {
		return this.db[model][DB_MAP[this.type]["findById"]](id, options);
	}

	create(model, options) {
		return this.db[model][DB_MAP[this.type]["create"]](options);
	}
}

module.exports = ModelWrapper;
