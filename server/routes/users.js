const express = require('express');
const router = express.Router();
const api = require('../userHandle');

/* Создание пользователя */
router.post('/login', function(req, res, next) {
	if (req.session.user) return res.redirect('/')

	api.checkUser(req.body)
		.then(function(user){
			if(user){
				req.session.user = {id: user._id, name: user.name}
				res.redirect('/')
			} else {
				return next(error)
			}
		})
		.catch(function(error){
			return next(error)
		})

});

router.post('/', function(req, res, next) {
    api.createUser(req.body)
    .then(function(result){
        console.log(`User ${req.body.user.user} created`)
		res.redirect('/');
    })
    .catch(function(err){
        if (err.code == 11000){
            res.status(500).send("This user already exist")
        }
    })
});

router.post('/logout', function(req, res, next) {
	if (req.session.user) {
		console.log("User logged out");
		delete req.session.user;
		res.redirect('/')
	}
});

module.exports = router;