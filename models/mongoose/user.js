var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
	'username' : String,
	'password' : String,
	'email' : String,
	'userTypeId' : Number
});

module.exports = mongoose.model('User', UserSchema);
