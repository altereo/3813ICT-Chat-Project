const logger = require('../logger.js');
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

var groups = [
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

var messages = {};

var groupsCollection;
var usersCollection;
var messagesCollection;

const generateID = (length) => {
	if (length < 1) return(-1);
	return(Math.floor((10 ** length) + Math.random() * (10 ** (length - 1) * 9)));
};

module.exports = {
	init: async (client, DB_NAME) => {
		if (!client) throw new Error("No MongoDB client supplied.");

		try {
			await client.connect();
			logger.log('MONG', 'Connected to database successfully.');
			db = client.db(DB_NAME);

			client.on('error', (err) => {
				logger.log('MONG', `Connection encountered an error: ${err}`);
			});

			client.on('close', () => {
				logger.log('MONG', "Connection to database server closed.");
			});

			client.on('reconnect', () => {
				logger.log("MONG", "Reconnected to MongoDB server.");
			});

		} catch (err) {
			logger.log('err', err);
			throw(err);
		}

		groupsCollection = db.collection('groups');
		usersCollection = db.collection('users');
		messagesCollection = db.collection('messages');
	},

	generateID: (length) => {
		if (length < 1) return(-1);
		return(Math.floor((10 ** length) + Math.random() * (10 ** (length - 1) * 9)));
	},

	getUser: async (userID) => {
		try {
			let user = await usersCollection.findOne({ id: +userID });
			return((user) ? user : {username: "ERROR"});
		} catch (err) {
			throw(err);
		}
	},

	getGroups: async () => {
		return((await groupsCollection.find({})).toArray());
	},

	getGroup: async (groupID) => {
		try {
			let group = await groupsCollection.findOne({ id: +groupID });
			return((group) ? group : {});
		} catch (err) {
			throw(err);
		}
	},

	validate: async(email, password) => {
		try {
			let user = await usersCollection.findOne({ email: email });
			if (user) {
				let valid = (user.password === password) || false;

				return({
					"username": valid && user?.username || null,
					"email": valid && user?.email || null,
					"id": valid && user?.id || -1,
					"roles": valid && user?.roles || [],
					"groups": valid && user?.groups || [],
					"valid": valid
				});
			}
		} catch (err) {
			throw(err);
		}
	},

	tryCreateUser: async (username, email, password) => {
		let userCheck = await usersCollection.findOne({ email: email });	// Check for existing user with that email.
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

			usersCollection.insertOne(newUser);
			return("OK");
		}
	},

	removeGroupFromUser: async (userID, groupID) => {
		let user = await usersCollection.findOne({ id: +userID });
		if (!user) return;

		let groupIndex = user.groups.indexOf(groupID);
		if (groupIndex !== -1) {
			let group = await groupsCollection.findOne({ id: +groupID });
			
			let userUpdates = {
				$set: {
					groups: user.groups.toSpliced(groupIndex, 1),
					roles: user.roles.toSpliced(
						user.roles.findIndex((role) => role.startsWith(`${groupID}::`)),
						1
					)
				}
			}
			let groupUpdates = {
				$set: {
					users: group.users.toSpliced(group.users.indexOf(userID), 1)
				}
			}

			await usersCollection.updateOne({ id: +userID }, userUpdates);
			await groupsCollection.updateOne({ id: +groupID }, groupUpdates);
		}
		return;
	},

	removeRequest: async (userID, groupID) => {
		let group = await groupsCollection.findOne({ id: +groupID });
		if (!group) return;

		let requestIndex = group.joinRequests.findIndex((req) => req === userID);
		if (requestIndex === -1) return;

		await groupsCollection.updateOne({ id: +groupID }, {
			$set: {
				joinRequests: group.joinRequests.toSpliced(requestIndex, 1)
			}
		});
		return;
	},

	addRequest: async (userID, groupID) => {
		let group = await groupsCollection.findOne({ id: +groupID });
		if (!group) return;

		if (
			!group.users.includes(userID) &&
			!group.joinRequests.includes(userID)
		) {
			await groupsCollection.updateOne({ id: +groupID }, {
				$addToSet: {
					joinRequests: userID
				}
			});
		}
		return;
	},

	addUserToGroup: async (userID, groupID) => {
		let user = await usersCollection.findOne({ id: +userID });
		let group = await groupsCollection.findOne({ id: +groupID });

		if (!user || !group) return;

		if (!user.groups.includes(groupID)) {
			await usersCollection.updateOne({ id: +userID }, {
				$addToSet: {
					groups: groupID
				}
			});
		}

		if (!group.users.includes(userID)) {
			await groupsCollection.updateOne({ id: +groupID }, {
				$addToSet: {
					users: userID
				}
			});
		}
		return;
	},

	renameGroup: async (groupID, newName) => {
		await groupsCollection.updateOne({ id: +groupID }, {
			$set: {
				name: newName
			}
		});
		return;
	},

	createChannel: async (groupID, channelName) => {
		await groupsCollection.updateOne({ id: +groupID }, {
			$addToSet: {
				channels: {
					"id": generateID(8),
					"name": channelName
				}
			}
		})
		return;
	},

	deleteChannel: async (groupID, channelID) => {
		let group = await groupsCollection.findOne({ id: +groupID });
		if (!group) return;

		await groupsCollection.updateOne({ id: +groupID }, {
			$set: {
				channels: group.channels.toSpliced(
					group.channels.findIndex((channel) => channel.id === channelID), 1
				) 
			}
		});
		return;
	},

	deleteGroup: async (groupID) => {
		let group = await groupsCollection.findOne({ id: +groupID });
		await Promise.all(group.users.map(async (userID) => {
			await usersCollection.updateOne({ id: +userID }, {
				$pull: {
					groups: groupID,
					roles: `${groupID}::ADMIN`
				}
			})
		}));
		await groupsCollection.deleteOne({ id: +groupID });
		return;
	},

	createGroup: async (name, user) => {
		let groupID = generateID(12);
		await groupsCollection.insertOne({
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
		
		await usersCollection.updateOne({ id: +user }, {
			$addToSet: {
				groups: groupID,
				roles: `${groupID}::ADMIN`
			}
		});

		return;
	},

	setPermissions: async (userID, groupID, level) => {
		let user = await usersCollection.findOne({ id: +userID });
		if (!user) return;

		if (level === 2) {
			await usersCollection.updateOne({ id: +userID }, {
				$addToSet: {
					roles: "SUPERADMIN"
				}
			});
			return;
		} else if (level === 1) {
			await usersCollection.updateOne({ id: +userID }, {
				$addToSet: {
					roles: `${groupID}::ADMIN`
				}
			});

			await usersCollection.updateOne({ id: +userID }, {
				$pullAll: {
					roles: ["SUPERADMIN"]
				}
			})
			return;
		} else if (level === 0) {
			await usersCollection.updateOne({ id: +userID }, {
				$pullAll: {
					roles: [`${groupID}::ADMIN`, "SUPERADMIN"]
				}
			});
			return;
		}
	},

	updateUserImage: async (filename, userID) => {
		await usersCollection.updateOne({ id: +userID }, {
			$set: {
				image: `${filename}`
			}
		});
		return;
	},

	storeMessage: async (groupID, channelID, message) => {
		await messagesCollection.updateOne({ id: `${groupID}::${channelID}` }, {
			$push: {
				messages: message
			}
		});
		return;
	},

	getMessages: async (before, groupID, channelID) => {
		const getUser = async (userID) => {
			try {
				let user = await usersCollection.findOne({ id: +userID });
				user = {
					email: user.email,
					username: user.username,
					roles: user.roles,
					groups: user.groups,
					image: user.image,
					id: user.id
				};

				return((user) ? user : {username: "ERROR"});
			} catch (err) {
				throw(err);
			}
		}

		let messages;
		if (before === "") {
			messages = (await messagesCollection.findOne({ id: `${groupID}::${channelID}` }, {
				projection: { messages: { $slice: -50 } }
			})).messages;

			messages = await Promise.all(messages.map(async (message) => {
				return({
					...message,
					author: await getUser(message.author)
				});
			}));
		} else {
			messages = (await (await messagesCollection.aggregate([
				{ $match: { id: `${groupID}::${channelID}` }},
				{
					$project: {
						messages: {
							$filter: {
								input:"$messages",
								as: "message",
								cond: { $lt: ["$$message.date", new Date(before)] }
							}
						}
					}
				},
				{ $project: { messages: { $slice: ["$messages", -50] } } }

			])).toArray())[0].messages;

			messages = await Promise.all(messages.map(async (message) => {
				return({
					...message,
					author: await getUser(message.author)
				});
			}));
		}
		
		return(messages);
	}
}
