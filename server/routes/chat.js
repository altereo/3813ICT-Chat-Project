const express = require('express');
const router = express.Router();

const storage = require('../datamodel/interface.js');

const fetchGroups = (id) => {
	let user = storage.getTable("users").find(user => user.id == id);
	if (!user) return([]);
	let groups = user.groups.map((id) => getGroup(id));

	return(groups.filter((val) => Object.keys(val).length !== 0));
}

const getGroup = (id) => {
	let group = storage.getTable("groups").find(group => group.id == id);
	if (!group) return({});

	return (group);
}

const getUser = (id) => {
	let user = storage.getTable("users").find(user => user.id == id);
	if (!user) return({"username": ""});

	return(user);
}

const getHighestForGroup = (userID, groupID) => {
	if (isSuperAdmin(userID)) return(2);

	let user = getUser(userID);
	if (user.roles.length === 0) return(0);

	if (user.roles.find((role) => role.startsWith(`${groupID}::`))) return(1);

	return(0);
}

const isSuperAdmin = (userID) => {
	return(getUser(userID).roles.includes("SUPERADMIN"));
}

router
.get('/', (req, res) => {
	res.json({"status": "OK"})
})

// Get a list of groups the user belongs to.
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

// Remove user from group.
.post('/group/remove', (req, res) => {
	let data = req.body;
	let executor = getUser(data.executor);

	if (getHighestForGroup(data.executor, data.group) >= 1 || data.user === data.executor) {
		if (getHighestForGroup(data.user, data.group) === 2) {
			res.json({
				"status": "ERROR",
				"message": "Cannot remove superuser from group."
			});
			return;
		}

		storage.removeGroupFromUser(data.user, data.group);
		res.json({
			"status": "OK",
			"message": ""
		});
		return;
	}

	res.json({
		"status": "ERROR",
		"message": "Insufficient privelages."
	});
	return;
})

// Rename group.
.post('/group/rename', (req, res) => {
	let data = req.body;
	if (getHighestForGroup(data.executor, data.group) >= 1) {
		if (data.newName === "") {
			res.json({
				"status": "ERROR",
				"message": "Group name cannot be empty."
			});
			return;
		}

		storage.renameGroup(data.group, data.newName);
		res.json({
			"status": "OK",
			"message": ""
		});
		return;
	}

	res.json({
		"status": "ERROR",
		"message": "Insufficient privelages."
	});
	return;
})

// Approve/reject request to join.
// Needs: user, group, state(approve/reject), executor
.post('/group/modifyRequest', (req, res) => {
	let data = req.body;
	if (getHighestForGroup(data.executor, data.group) >= 1) {
		if (data.state === true) {
			storage.removeRequest(data.user, data.group);
			storage.addUserToGroup(data.user, data.group);
		} else {
			storage.removeRequest(data.user, data.group);
		}

		res.json({
			"status": "OK",
			"message": ""
		})
		return;
	}

	res.json({
		"status": "ERROR",
		"message": "Insufficient privelages."
	});
	return;
})

// Create a new channel for the given group.
// Takes: group, name, executor
.post('/group/channels/create', (req, res) => {
	let data = req.body;
	if (getHighestForGroup(data.executor, data.group) >= 1) {
		if (data.name) {
			storage.createChannel(data.group, data.name);
			res.json({
				"status": "OK",
				"message": ""
			});
			return;
		} else {
			res.json({
				"status": "ERROR",
				"message": "Channel name may not be empty."
			});
			return;
		}
	}

	res.json({
		"status": "ERROR",
		"message": "Insufficient privelages."
	});
	return;
})


// Delete a channel.
// Takes: group, channel, executor
.post('/group/channels/remove', (req, res) => {
	let data = req.body;
	if (getHighestForGroup(data.executor, data.group) >= 1) {
		if (data.group && data.channel) {
			storage.deleteChannel(data.group, data.channel);
			res.json({
				"status": "OK",
				"message": ""
			});
			return;
		}

		res.json({
			"status": "ERROR",
			"message": "Group or channel ID missing."
		});
		return;
	}

	res.json({
		"status": "ERROR",
		"message": "Insufficient privelages."
	});
	return;
})

// delete a group.
// takes group, executor
.post('/group/delete', (req, res) => {
	let data = req.body;
	if (getHighestForGroup(data.executor, data.group) >= 1) {
		let groupObj = getGroup(data.group);
		storage.deleteGroup(data.group);
		res.json({
			"status": "OK",
			"message": ""
		});
		return;
	}

	res.json({
		"status": "ERROR",
		"message": "You do not have the ability to perform this action."
	});
	return;
})

// Create a group.
// takes name, executor
.post('/group/create', (req, res) => {
	let data = req.body;
	if (getUser(data.executor).roles.filter((role) => role.includes("ADMIN"))) {
		storage.createGroup(data.name, data.executor);
		res.json({
			"status": "OK",
			"message": "",
			"roles": getUser(data.executor).roles
		});
		return;
	}

	res.json({
		"status": "ERROR",
		"message": "You do not have the ability to perform this action."
	});
	return;
})

// Request to join a group.
// takes code, executor
.post('/group/request', (req, res) => {
	let data = req.body;
	try {
		storage.addRequest(data.executor, parseInt(data.code, 36));
		res.json({
			"status": "OK",
			"message": ""
		});
		return;
	} catch (e) {
		res.json({
			"status": "ERROR",
			"message": "Invalid join code."
		});
		return;
	}

	return;
})

// Get last 50 messages in a channel.
// takes group, channel
.get('/group/messages', (req, res) => {
	let channelID = req.params.channelID;
	res.json({
		"status": "NOT_IMPLEMENTED",
		"messages": []
	});
	return;
})

// Get username of user by ID.
.get('/users/username/:userID', (req, res) => {
	let userID = req.params.userID;
	res.json({
		"status": "OK",
		"username": getUser(userID).username || ""
	});
	return;
})

// Get roles of user by ID.
.get('/users/roles/:userID', (req, res) => {
	let userID = req.params.userID;
	res.json({
		"status": "OK",
		"roles": getUser(userID).roles || []
	});
	return;
})

// Get user details.
.get('/users/:userID', (req, res) => {
	let userID = req.params.userID;
	res.json({
		"status": "OK",
		"user": getUser(userID) || {}
	});
	return;
})

// Change the permissions of the user.
// Requres: group, user, role, executor
// Role = 0: User
// Role = 1: Admin
// Role = 2: Operator (Superadmin)
.post('/group/user/promote', (req, res) => {
	let data = req.body;
	let executorLevel = getHighestForGroup(data.executor, data.group);
	if (executorLevel >= 1 && executorLevel >= data.role) {
		storage.setPermissions(data.user, data.group, data.role);
		res.json({
			"status": "OK",
			"message": ""
		});
		return;
	}
	res.json({
		"status": "ERROR",
		"message": "Insufficient privelages."
	});
	return;
});

module.exports = router;