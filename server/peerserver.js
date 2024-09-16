const { ExpressPeerServer } = require('peer');

const logger = require('./logger.js');
const storage = require('./datamodel/interface');

const connectionRequests = [];
const activeConnections = [];

module.exports = {
	init: (app, server) => {
		const peerServer = ExpressPeerServer(server, {
			debug: true,
			path: "/"
		});

		app.use('/peerserv', peerServer);

		peerServer.on('connection', (id) => {
			logger.log("peer", `[ ${id} ] connected to peer server.`);
		});

		peerServer.on('disconnect', (id) => {
			logger.log("peer", `[ ${id} ] disconnected from peer server.`);
		});
	}
}