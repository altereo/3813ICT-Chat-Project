const express = require('express');
const { Server } = require("socket.io");

const logger = require('./logger.js');
const sockets = require('./sockets.js');

var app = express();

var cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var http = require('http').Server(app);
var io = new Server(http, {
	cors: {
		origin: "http://localhost:4200",
		methods: ["GET", "POST"]
	}
});

const PORT = 3000;
const CDN_DIR = "./www";

// Additional routes.
var authRoutes = require('./routes/auth.js');
var chatRoutes = require('./routes/chat.js');
var imageRoutes = require('./routes/image.js');

// Log requests to console.
app.use((req, res, next) => {
	logger.log(req.protocol, `${req.hostname} ${req.method} ${req.path}`);
	next();
});

sockets.connect(io, PORT)

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

	console.log("3813ICT Chat Server");
	logger.log("info", `Server began listening on: \x1b[36mhttp://${host}:${port}\x1b[97m`);
});