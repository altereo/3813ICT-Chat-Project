/*
	ROLE VALUES
	- SUPERADMIN	
	- ID::ADMIN

	ID Schema:
	- User IDs are 9 digits.
	- Group IDs are 12 digits.
	- Channel IDs are 8 digits.
*/

var users = [
	{
		"email": "admin@gmail.com",
		"username": "Superadmin",
		"password": "123",
		"roles": ["SUPERADMIN"],
		"groups": [324123246245, 124532467324],
		"image": "",
		"id": 914976000
	},
	{
		"email": "evan.lee@gmail.com",
		"username": "Altereo",
		"password": "123",
		"roles": ["SUPERADMIN"],
		"groups": [324123246245, 124532467324],
		"image": "",
		"id": 535134682
	},
	{
		"email": "alice.margatroid@gmail.com",
		"username": "rainbowPuppeteer",
		"password": "123",
		"roles": ["324123246245::ADMIN"],
		"groups": [324123246245, 124532467324],
		"image": "",
		"id": 663242268
	},
	{
		"email": "tim.price@gmail.com",
		"username": "timmy_.",
		"password": "123",
		"roles": [],
		"groups": [124532467324],
		"image": "",
		"id": 127845683
	}
];

const groups = [
	{
		"id": 324123246245,
		"name": "Test Server",
		"channels": [
			{
				"id": 19384920,
				"name": "general-1"
			},
			{
				"id": 24242593,
				"name": "general-2"
			}
		],
		"users": [914976000, 535134682, 663242268],
		"joinRequests": [127845683],
		"creator": 663242268
	},
	{
		"id": 124532467324,
		"name": "Test Server 2",
		"channels": [
			{
				"id": 19384920,
				"name": "general-1"
			},
			{
				"id": 38299480,
				"name": "homework-help"
			}
		],
		"users": [914976000, 535134682, 127845683, 663242268],
		"joinRequests": [],
		"creator": 535134682
	}
]


const tableSet = {
	users,
	groups
};

function getTable(type) {
	return(tableSet[type]);
}

function generateID(length) {
	if (length < 1) return(-1);
	return(Math.floor((10 ** length) + Math.random() * (10 ** (length - 1) * 9)));
}

function tryCreateUser(username, email, password) {
	let userCheck = users.find(cred => cred.email === email);	// Check for existing user with that email.
	if (userCheck || !email || !username || !password) {
		return("ERROR");
	} else {
		let newUser = {
			"email": email,
			"username": username,
			"password": password,
			"roles": [],
			"groups": [],
			"image": "",
			"id": generateID(9) // Might risk ID collision but who cares.
		}

		users.push(newUser);
		return("OK");
	}
}

function removeGroupFromUser(userID, groupID) {
	let userIndex = users.findIndex((user) => user.id === userID);
	if (userIndex === -1) return;

	let groupIndex = users[userIndex].groups.indexOf(groupID);
	if (groupIndex !== -1) {
		let groupsIndex = groups.findIndex((group) => group.id === groupID);
		users[userIndex].groups = users[userIndex].groups.splice(groupIndex, 1);
		users[userIndex].roles.splice(
			users[userIndex].roles.findIndex((role) => role.startsWith(`${groupID}::`)),
			1
		);
		groups[groupsIndex].users.splice(groups[groupsIndex].users.indexOf(userID));
	}
	return;
}

function removeRequest(userID, groupID) {
	let groupIndex = groups.findIndex((group) => group.id === groupID);
	let requestIndex = groups[groupIndex].joinRequests.findIndex((req) => req === userID);
	if (groupIndex === -1 || requestIndex === -1) return;

	groups[groupIndex].joinRequests.splice(requestIndex, 1);
	return;
}

function addRequest(userID, groupID) {
	let groupIndex = groups.findIndex((group) => group.id === groupID);
	if (
		!groups[groupIndex].users.includes(userID) &&
		!groups[groupIndex].joinRequests.includes(userID)
	) {
		groups[groupIndex].joinRequests.push(userID);
	}
	return;
}

function addUserToGroup(userID, groupID) {
	let userIndex = users.findIndex((user) => user.id === userID);
	let groupIndex = groups.findIndex((group) => group.id === groupID);
	if (userIndex === -1 || groupIndex === -1) return;

	if (!users[userIndex].groups.includes(groupID)) {
		users[userIndex].groups.push(groupID);
	}

	if (!groups[groupIndex].users.includes(userID)) {
		groups[groupIndex].users.push(userID);
	}
	return;
}

function renameGroup(groupID, newName) {
	groups[groups.findIndex((group) => group.id === groupID)].name = newName;
	return;
}

function createChannel(groupID, channelName) {
	groups[groups.findIndex((group) => group.id === groupID)].channels.push({
		"id": generateID(8),
		"name": channelName
	});
	return;
}

function deleteChannel(groupID, channelID) {
	let groupIndex = groups.findIndex((group) => group.id === groupID);

	groups[groupIndex].channels.splice(
		groups[groupIndex].channels.findIndex((channel) => channel.id === channelID), 1
	)
	return;
}

function deleteGroup(groupID) {
	groups.splice(groups.findIndex((group) => group.id === groupID), 1);

	return;
}

function createGroup(name, user) {
	let groupID = generateID(12);
	groups.push({
		"id": groupID,
		"name": name,
		"channels": [
			{
				"id": generateID(8),
				"name": "general"
			}
		],
		"users": [user],
		"joinRequests": [],
		"creator": user
	});
	addUserToGroup(user, groupID);
	users[users.findIndex((item) => item.id === user)].roles.push(`${groupID}::ADMIN`);
}

function updateUserImage(filename, userID) {
	let userIndex = users.findIndex((user) => user.id === userID);
	if (userIndex !== -1) {
		users[userIndex].image = `/avatar/${filename}`;
	}
	return;
}

module.exports = { 
	getTable,
	tryCreateUser,
	removeGroupFromUser,
	renameGroup,
	addUserToGroup,
	removeRequest,
	addRequest,
	createChannel,
	deleteChannel,
	deleteGroup,
	createGroup,
	updateUserImage
};