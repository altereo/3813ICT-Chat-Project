// For the support of uploading and retrieving images.
const express = require('express');
const router = express.Router();

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = require('../datamodel/interface.js');
const CDN_DIR = `${__dirname}/../www`;

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

const getUser = (id) => {
	let user = storage.getTable("users").find(user => user.id == id);
	if (!user) return({"username": ""});

	return(user);
}

async function doesFileExist(filePath) {
	try {
		await fs.promises.stat(filePath);
		return(true)
	} catch (err) {
		if (err.code === "ENOENT") {
			return(false);
		} else {
			throw(err);
		}
	} 
}

router

// Upload avatar image.
// user, file (blob)
.post('/avatar', upload.single('file'), async (req, res) => {
	let userID = req.body.user;
	if (userID === -1) {
		res.status(403).send(`Invalid user ID.`);
		return;
	}

	try {
		if (!req.file) {
			return(res.status(400).send('Tabula Rasa :: Empty request.'));
		}

		// Create a filename and path. filename should be swapped for user id later,
		let fileName = `${userID}-${generateID(6)}.webp`;
		let filePath = path.join(`${CDN_DIR}/avatar`, fileName);

		// Remove existing profile picture.

		// Resize, crop, convert.
		await sharp(req.file.buffer)
			.resize(128, 128)
			.toFormat('webp')
			.toFile(filePath);

		// Delete existing profile image.
		let originalPath = getUser(+userID).image;
		if (originalPath) {
			let cloudedPath = path.join(`${CDN_DIR}/avatar`, originalPath);
			if (doesFileExist(cloudedPath)) {
				await fs.promises.unlink(cloudedPath);
			}
		}

		storage.updateUserImage(fileName, +userID);
		res.status(200).json({
			"status": "OK",
			"message": `${fileName}`
		});
	} catch (err) {
		console.error(err);
		res.status(500).send(`Internal server error.`);
	}
})

module.exports = router;