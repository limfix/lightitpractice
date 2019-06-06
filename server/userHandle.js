const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./models/userSchema');

exports.createUser = function(userData){
	var user = {
		username: userData.username,
		password: hash(userData.password)
	}
	return new User(user).save()
}

exports.getUser = function(id) {
	return User.findOne(id)
}

exports.checkUser = function(userData) {
	return User
		.findOne({email: userData.email})
		.then(function(doc){
			if ( doc.password == hash(userData.password) ){
				console.log("User password is ok");
				return Promise.resolve(doc)
			} else {
				return Promise.reject("Error wrong")
			}
        })
        .catch((err)=> {
            return Promise.reject("User not found");
        })
}

function hash(text) {
	return crypto.createHash('sha1')
	.update(text).digest('base64')
}