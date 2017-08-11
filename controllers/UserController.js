const getModelWrapper = require("../models/index");
let wrapper = getModelWrapper();
/**
 * UserController.js
 *
 * @description :: Server-side logic for managing Users.
 */
module.exports = {
	/**
   * UserController.index()
   */
	index: function(req, res) {
		Promise.all([wrapper.findAllUsers()])
			.then(_renderUsersIndex)
			.catch(err => console.error(err));

		function _renderUsersIndex(data) {
			let [users] = data;

			res.render("users/index", { users });
		}
	},

	/**
   * UserController.view()
   */
	view: function(req, res) {
		const id = req.params.id;

		Promise.all([wrapper.findUserById(id)])
			.then(_renderUserView)
			.catch(err => console.error(err));

		function _renderUserView(data) {
			let [user] = data;

			if (!user) {
				return res.status(404).json({
					message: "No such User"
				});
			}

			res.render("users/view", { user });
		}
	},

	/**
   * UserController.create()
   */
	create: function(req, res) {
		if (!req.body.username || !req.body.password || !req.body.email) {
			return res.json({
				confirmation: "fail",
				message: "please enter all fields"
			});
		}

		wrapper
			.findAllUsers({ where: { email: req.body.email } })
			.then(users => {
				if (users.length) {
					return res.json({
						confirmation: "fail",
						message: "user already exists"
					});
				}

				return wrapper.createNewUser(req.body);
			})
			.then(user => {
				req.session["loggedIn"] = true;
				res.redirect(`/users/${user.id}`);
			})
			.catch(err => console.error(err));
	},

	/**
   * UserController.update()
   */
	update: function(req, res) {
		var id = req.params.id;
		User.findOne({ _id: id }, function(err, User) {
			if (err) {
				return res.status(500).json({
					message: "Error when getting User",
					error: err
				});
			}
			if (!User) {
				return res.status(404).json({
					message: "No such User"
				});
			}

			User.username = req.body.username ? req.body.username : User.username;
			User.password = req.body.password ? req.body.password : User.password;
			User.email = req.body.email ? req.body.email : User.email;
			User.userTypeId = req.body.userTypeId
				? req.body.userTypeId
				: User.userTypeId;

			User.save(function(err, User) {
				if (err) {
					return res.status(500).json({
						message: "Error when updating User.",
						error: err
					});
				}

				return res.json(User);
			});
		});
	},

	/**
   * UserController.remove()
   */
	remove: function(req, res) {
		var id = req.params.id;
		User.findByIdAndRemove(id, function(err, User) {
			if (err) {
				return res.status(500).json({
					message: "Error when deleting the User.",
					error: err
				});
			}
			return res.status(204).json();
		});
	}
};
