const express = require('express');
const router = express.Router();

const storage = require('../datamodel/interface.js');


router.post('/create', async (req, res) => {
	let data = req.body;
	res.json({
		"status": (await storage.tryCreateUser(data.username, data.email, data.password)) || { valid: false }
	});
});

router.post('/', async (req, res) => {
	let authData = req.body;
	res.json({
		"status": "OK",
		"user": (await storage.validate(authData.email, authData.password)) || { valid: false }
	});
	return;
});

module.exports = router;