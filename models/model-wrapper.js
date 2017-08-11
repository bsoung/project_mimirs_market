const DB_MAP = {
	sequelize: {
		findAll: "findAll",
		findById: "findById",
		create: "create",
		save: "save"
	},
	mongoose: {
		findAll: "find",
		findById: "findById",
		create: "create",
		save: "save"
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

	save(model) {
		return this.db[model][DB_MAP[this.type]["create"]]();
	}
}

module.exports = ModelWrapper;
