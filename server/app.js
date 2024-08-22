const express = require('express');

const auth = require('./auth.js');
const logger = require('./logger.js');

var app = express();

var cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var http = require('http').Server(app);


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

// Get a list of group IDs the user belongs to.
app.get('/api/groups/:userID', (req, res) => {
	let id = req.params.userID;
	res.json({
		"status": "OK",
		"groups": auth.fetchGroups(id)
	});
	return;
});

app.get('/api/channels/:groupID', (req, res) => {
	let groupID = req.params.groupID;
	res.json({
		"status": "NOT_IMPLEMENTED",
		"channels": []
	});
	return;
});

app.get('/api/messages/:channelID', (req, res) => {
	let channelID = req.params.channelID;
	res.json({
		"status": "NOT_IMPLEMENTED",
		"messages": []
	});
	return;
})


// Start the server.
let server = http.listen(3000, "127.0.0.1", () => {
	let host = server.address().address;
	let port = server.address().port;

	console.log("3813ICT Chat Server");
	logger.log("info", `Server began listening on: \x1b[36mhttp://${host}:${port}\x1b[97m`);
});