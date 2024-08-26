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
		"id": 914976000
	},
	{
		"email": "evan.lee@gmail.com",
		"username": "Altereo",
		"password": "123",
		"roles": ["SUPERADMIN"],
		"groups": [324123246245, 124532467324],
		"id": 535134682
	},
	{
		"email": "alice.margatroid@gmail.com",
		"username": "rainbowPuppeteer",
		"password": "123",
		"roles": ["324123246245::ADMIN"],
		"groups": [324123246245, 124532467324],
		"id": 663242268
	},
	{
		"email": "tim.price@gmail.com",
		"username": "timmy_.",
		"password": "123",
		"roles": [],
		"groups": [124532467324],
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
		"users": [914976000, 535134682, 127845683],
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
			"id": Math.floor(100000000 + Math.random() * 900000000) // Might risk ID collision but who cares.
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
		groups[groupsIndex].users.splice(groups[groupsIndex].users.indexOf(userID));
	}
	return;
}

module.exports = { getTable, tryCreateUser, removeGroupFromUser };