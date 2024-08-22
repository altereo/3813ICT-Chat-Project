const express = require('express');

const auth = require('./auth.js');
const logger = require('./logger.js');

var app = express();

var cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var http = require('http').Server(app);

// Additional routes.
var chatRoutes = require('./routes/chat.js');


// Log requests to console.
app.use((req, res, next) => {
	logger.log(req.protocol, `${req.hostname} ${req.method} ${req.path}`);
	next();
});


// Authenticate user.
app.post('/api/auth', (req, res) => {
	let authData = req.body;
	res.json({
		"status": "OK",
		"user": auth.validate(authData.email, authData.password)
	});
	return;
});


// Import the chat routes under the chat path.
app.use('/api/chat', chatRoutes);



// Start the server.
let server = http.listen(3000, "127.0.0.1", () => {
	let host = server.address().address;
	let port = server.address().port;

	console.log("3813ICT Chat Server");
	logger.log("info", `Server began listening on: \x1b[36mhttp://${host}:${port}\x1b[97m`);
});