const { ExpressPeerServer } = require('peer');

const logger = require('./logger.js');
const storage = require('./datamodel/interface');

var rooms = {};
var connections = {};
var pending = [];

module.exports = {
	init: (app, server) => {
		const peerServer = ExpressPeerServer(server, {
			debug: true,
			path: "/"
		});

		// Since it doesn't seem to be possible to past data to the signaling
		// server, we'll do it this way.
		// Takes user, group, channel, peerID
		app.post('/peerserv/associate', (req, res) => {
			let { user, group, channel, peerID } = req.body;
			if (pending.includes(peerID)) {
				pending = pending.toSpliced(pending.indexOf(peerID), 1);
				if (!rooms[`${group}`]) rooms[`${group}`] = {};
				if (!rooms[`${group}`][`${channel}`]) rooms[`${group}`][`${channel}`] = [];

				if (rooms[`${group}`][`${channel}`]) {
					rooms[`${group}`][`${channel}`].push({
						user,
						peer: peerID
					});
				} else {
					rooms[`${group}`][`${channel}`] = [{
						user,
						peer: peerID
					}];
				}

				connections[`${peerID}`] = {
					group,
					channel
				};

				logger.log("peer", `[ ${user} ] associated with peer.`)
				res.json({
					"status": "OK",
					"peers": rooms[`${group}`][`${channel}`]
				});
				return;
			}

			res.json({
				"status": "ERROR",
				"message": "Possible race condition. Provided peer ID is not present in memory."
			});
			return;
		});

		// Shortcut to get peers in conference.
		app.get('/peerserv/peers/:group/:channel', (req, res) => {
			let group = req.params.group;
			let channel = req.params.channel;

			if (rooms[`${group}`]) {
				if (rooms[`${channel}`]) {
					res.json({
						"status": "OK",
						"peers": rooms[`${group}`][`${channel}`]
					});
					return;
				}
			}

			res.json({
				"status": "ERROR",
				"message": "Invalid group or channel. No peers found."
			});
			return;
		});

		app.use('/peerserv', peerServer);

		peerServer.on('connection', (client) => {
			logger.log("peer", `[ ${client.id} ] connected to peer server.`);
			pending.push(client.id);
		});

		peerServer.on('disconnect', (client) => {
			try {
				let { group, channel } = connections[`${client.id}`];
				rooms[`${group}`][`${channel}`] = rooms[`${group}`][`${channel}`].filter((item) => {
					return(item.peer !== client.id);
				});
			} catch (err) {
				logger.log('warn', `Error encountered while unlinking user.`);
			}
			delete connections[`${client.id}`];
			logger.log("peer", `[ ${client.id} ] disconnected from peer server.`);
		});
	}
}