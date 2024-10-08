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

		// Create a filename and path.
		let fileName = `${userID}-${storage.generateID(6)}.webp`;
		let filePath = path.join(`${CDN_DIR}/avatar`, fileName);

		// Resize, crop, convert.
		await sharp(req.file.buffer)
			.resize(128, 128)
			.toFormat('webp')
			.toFile(filePath);

		// Delete existing profile image.
		let originalPath = await storage.getUser(+userID).image;
		if (originalPath) {
			let cloudedPath = path.join(`${CDN_DIR}/avatar`, originalPath);
			if (doesFileExist(cloudedPath)) {
				await fs.promises.unlink(cloudedPath);
			}
		}

		await storage.updateUserImage(fileName, +userID);
		res.status(200).json({
			"status": "OK",
			"message": `${fileName}`
		});
	} catch (err) {
		console.error(err);
		res.status(500).send(`Internal server error.`);
	}
	return;
})

// Upload image. Returns url for attachment to message.
.post('/image', upload.single('file'), async(req, res) => {
	try {
		if (!req.file) {
			return(res.status(400).send("Tabula Rasa :: Empty request."));
		}

		// Generate filename and path.
		let fileName = `${Date.now()}-${storage.generateID(8)}.webp`;
		let filePath = path.join(`${CDN_DIR}/uploads`, fileName);

		// Convert.
		await sharp(req.file.buffer)
			.toFormat('webp')
			.toFile(filePath)

		// Respond with new filename.
		res.status(200).json({
			"status": "OK",
			"filename": fileName
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal server error.");
	}
	return;
})

module.exports = router;