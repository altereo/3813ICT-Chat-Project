const express = require('express');
const router = express.Router();

const storage = require('../datamodel/interface.js');

const fetchGroups = (id) => {
	let user = storage.getTable("users").find(user => user.id == id);
	if (!user) return([]);

	return(user.groups);
}

const getGroup = (id) => {
	let group = storage.getTable("groups").find(group => group.id == id);
	if (!group) return({});

	return (group);
}


router
.get('/', (req, res) => {
	res.json({"status": "OK"})
})

// Get a list of group IDs the user belongs to.
.get('/groups/:userID', (req, res) => {
	let id = req.params.userID;
	res.json({
		"status": "OK",
		"groups": fetchGroups(id)
	});
	return;
})

// Get information on a given group.
.get('/group/:groupID', (req, res) => {
	let groupID = req.params.groupID;
	res.json({
		"status": "OK",
		"group": getGroup(groupID)
	});
	return;
})

// Get all messages in a channel.
.get('/messages/:channelID', (req, res) => {
	let channelID = req.params.channelID;
	res.json({
		"status": "NOT_IMPLEMENTED",
		"messages": []
	});
	return;
})

module.exports = router;