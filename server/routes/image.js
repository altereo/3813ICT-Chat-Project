// For the support of uploading and retrieving images.
const express = require('express');
const router = express.Router();

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = require('../datamodel/interface.js');
const CDN_DIR = "../www";

// Multer storage for working with form images in memory.
const store = multer.memoryStorage();
const upload = multer({ 
	storage: store,
	limits: { fileSize: 5e7 }
});

function generateID(length) {
	if (length < 1) return(-1);
	return(Math.floor((10 ** length) + Math.random() * (10 ** (length - 1) * 9)));
}

router

// Upload avatar image.
.post('/avatar', upload.single('image'), async (req, res) => {
	let userID = req.body.user;

	try {
		if (!req.file) {
			return(res.status(400).send('Tabula Rasa :: Empty request.'));
		}

		// Create a filename and path. filename should be swapped for user id later,
		let fileName = `${Date.now()}-${generateID(5)}.webp`;
		let filePath = path.join(`${CDN_DIR}/avatar`, fileName);

		// Resize, crop, convert.
		await sharp(req.file.buffer)
			.resize(128, 128)
			.toFormat('webp')
			.toFile(filePath);

		storage.updateUserImage(fileName, userID);
		res.status(200).json({
			"status": "OK",
			"message": `/avatar/${fileName}`
		});
	} catch (err) {
		res.status(500).send("Internal server error.");
	}
})

module.exports = router;