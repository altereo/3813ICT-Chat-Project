const express = require('express');
const { Server } = require("socket.io");
const { MongoClient } = require('mongodb');

const logger = require('./logger.js');
const sockets = require('./sockets.js');
const rtcserver = require('./rtcserver.js');
const storage = require('./datamodel/interface.js');

var app = express();

// Setup CORS properly.
var cors = require('cors');
app.use(cors());

// Allow request body data to be JSON/FormData
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure socket server.
var http = require('http').Server(app);
var io = new Server(http, {
	cors: {
		origin: "http://localhost:4200",
		methods: ["GET", "POST"]
	}
});

// Constants for server and db access.
const DB_URL = "mongodb://localhost:27017";
const DB_NAME = "3813ICT-Chat";
const PORT = 3000;
const CDN_DIR = "./www";

async function init() {
	console.log("3813ICT Chat Server");

	// Connect to MongoDB and initialise storage interface.
	const client = new MongoClient(DB_URL);
	await storage.init(client, DB_NAME);


	// Additional routes.
	var authRoutes = require('./routes/auth.js');
	var chatRoutes = require('./routes/chat.js');
	var imageRoutes = require('./routes/image.js');

	// Log requests to console.
	app.use((req, res, next) => {
		logger.log(req.protocol, `${req.hostname} ${req.method} ${req.path}`);
		next();
	});

	// Initialise sockets
	sockets.connect(io, PORT)

	// Initialise peer server.
	rtcserver.init(app, http);

	// Host image folders.
	app.use('/avatar', express.static(`${CDN_DIR}/avatar`));
	app.use('/uploads', express.static(`${CDN_DIR}/uploads`));

	// Import auth routes.
	app.use('/api/auth', authRoutes)


	// Import the chat routes under the chat path.
	app.use('/api/chat', chatRoutes);

	// Import the image routes.
	app.use('/api/upload', imageRoutes);


	// Start the server.
	let server = http.listen(PORT, "127.0.0.1", () => {
		let host = server.address().address;
		let port = server.address().port;

		logger.log("info", `Server began listening on: \x1b[36mhttp://${host}:${port}\x1b[97m`);
	});
}

init();