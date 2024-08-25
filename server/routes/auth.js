const express = require('express');
const router = express.Router();

const storage = require('../datamodel/interface.js');

const validate = (email, password) => {
	let cred = storage.getTable("users").find(cred => cred.email === email);
	let valid = (cred && cred.password === password) || false;

	return({
		"username": valid && cred?.username || null,
		"email": valid && cred?.email || null,
		"id": valid && cred?.id || -1,
		"roles": valid && cred?.roles || [],
		"groups": valid && cred?.groups || [],
		"valid": valid
	});
};


router.post('/create', (req, res) => {
	let data = req.body;
	res.json({
		"status": storage.tryCreateUser(data.username, data.email, data.password)
	});
});

router.post('/', (req, res) => {
	let authData = req.body;
	res.json({
		"status": "OK",
		"user": validate(authData.email, authData.password)
	});
	return;
});

module.exports = router;