const express = require('express');
const router = express.Router();

const storage = require('../datamodel/interface.js');

const fetchGroups = async (id) => {
	let user = await storage.getUser(id);
	if (!user) return([]);

	if (await isSuperAdmin(id)) {
		return(await storage.getGroups());
	}

	let groups = await Promise.all(user?.groups.map(async (id) => {
		return(await storage.getGroup(id));
	}));

	return(groups.filter((val) => Object.keys(val).length !== 0));
}

const isSuperAdmin = async (userID) => {
	return((await storage.getUser(userID)).roles.includes("SUPERADMIN"));
}

const getHighestForGroup = async (userID, groupID) => {
	if (await isSuperAdmin(userID)) return(2);

	let user = await storage.getUser(userID);
	if (user.roles.length === 0) return(0);

	if (user.roles.find((role) => role.startsWith(`${groupID}::`))) return(1);

	return(0);
}


router
.get('/', (req, res) => {
	res.json({"status": "OK"})
})

// Get a list of groups the user belongs to.
.get('/groups/:userID', async (req, res) => {
	let id = req.params.userID;
	res.json({
		"status": "OK",
		"groups": await fetchGroups(id)
	});
	return;
})

// Get information on a given group.
.get('/group/:groupID', async (req, res) => {
	let groupID = req.params.groupID;
	res.json({
		"status": "OK",
		"group": await storage.getGroup(groupID)
	});
	return;
})

// Remove user from group.
.post('/group/remove', async (req, res) => {
	try{
		let data = req.body;
		if (
			data.executor === undefined ||
			data.group === undefined ||
			data.user === undefined
		) { throw("Missing parameter") }

		if (await getHighestForGroup(data.executor, data.group) >= 1 || data.user === data.executor) {
			if (await getHighestForGroup(data.user, data.group) === 2) {
				res.json({
					"status": "ERROR",
					"message": "Cannot remove superuser from group."
				});
				return;
			}

			await storage.removeGroupFromUser(data.user, data.group);
			res.json({
				"status": "OK",
				"message": ""
			});
			return;
		}
	} catch (err) {
		res.json({
			"status": "ERROR",
			"message": err
		});
	}

	res.json({
		"status": "ERROR",
		"message": "Insufficient privelages."
	});
	return;
})

// Rename group.
.post('/group/rename', async (req, res) => {
	let data = req.body;
	if (await getHighestForGroup(data.executor, data.group) >= 1) {
		if (data.newName === "") {
			res.json({
				"status": "ERROR",
				"message": "Group name cannot be empty."
			});
			return;
		}

		await storage.renameGroup(data.group, data.newName);
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
.post('/group/modifyRequest', async (req, res) => {
	let data = req.body;
	if (await getHighestForGroup(data.executor, data.group) >= 1) {
		if (data.state === true) {
			await storage.removeRequest(data.user, data.group);
			await storage.addUserToGroup(data.user, data.group);
		} else {
			await storage.removeRequest(data.user, data.group);
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
.post('/group/channels/create', async (req, res) => {
	let data = req.body;
	if (await getHighestForGroup(data.executor, data.group) >= 1) {
		if (data.name) {
			await storage.createChannel(data.group, data.name);
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
.post('/group/channels/remove', async (req, res) => {
	let data = req.body;
	if (await getHighestForGroup(data.executor, data.group) >= 1) {
		if (data.group && data.channel) {
			await storage.deleteChannel(data.group, data.channel);
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
.post('/group/delete', async (req, res) => {
	let data = req.body;
	if (await getHighestForGroup(data.executor, data.group) >= 1) {
		let groupObj = await storage.getGroup(data.group);
		await storage.deleteGroup(data.group);
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
.post('/group/create', async(req, res) => {
	let data = req.body;
	if ((await storage.getUser(data.executor)).roles.filter((role) => role.includes("ADMIN"))) {
		let newGroupID = await storage.createGroup(data.name, data.executor);
		res.json({
			"status": "OK",
			"message": newGroupID
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
.post('/group/request', async (req, res) => {
	let data = req.body;
	try {
		await storage.addRequest(data.executor, parseInt(data.code, 36));
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

// Get messages in a channel.
// takes group, channel, before
.post('/group/messages', async (req, res) => {
	let data = req.body;
	if (data.group !== undefined && data.channel !== undefined && data.before !== undefined) {
		try {
			let messages = await storage.getMessages(data.before, data.group, data.channel);
			res.json({
				"status": "OK",
				"messages": messages || []
			});
			return;
		} catch (err) {
			res.json({
				"status": "ERROR",
				"message": err.toString()
			});
			return;
		}
		return;
	}

	res.json({
		"status": "ERROR",
		"messages": "Missing parameters."
	});
	return;
})

// Get username of user by ID.
.get('/users/username/:userID', async (req, res) => {
	let userID = req.params.userID;
	res.json({
		"status": "OK",
		"username": (await storage.getUser(userID)).username || "ERROR"
	});
	return;
})

// Get roles of user by ID.
.get('/users/roles/:userID', async (req, res) => {
	let userID = req.params.userID;
	res.json({
		"status": "OK",
		"roles": await storage.getUser(userID).roles || []
	});
	return;
})

// Get user details.
.get('/users/:userID', async (req, res) => {
	let userID = req.params.userID;
	res.json({
		"status": "OK",
		"user": await storage.getUser(userID) || {}
	});
	return;
})

// Change the permissions of the user.
// Requres: group, user, role, executor
// Role = 0: User
// Role = 1: Admin
// Role = 2: Operator (Superadmin)
.post('/group/user/promote', async (req, res) => {
	let data = req.body;
	let executorLevel = await getHighestForGroup(data.executor, data.group);
	if (executorLevel >= 1 && executorLevel >= data.role) {
		await storage.setPermissions(data.user, data.group, data.role);
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

// Keep track of where a particular user is (what channel they are viewing)
// requires: user, group, channel
.post('/group/user/notify', async (req, res) => {
	let data = req.body;
	if (data.user && data.group && data.channel) {
		res.json({
			"status": "OK",
			"viewers": await storage.updateViewer(data.user, +data.group, +data.channel)
		});
		return;
	}

	res.json({
		"status": "ERROR",
		"message": "Missing parameter."
	});
	return;
})

module.exports = router;