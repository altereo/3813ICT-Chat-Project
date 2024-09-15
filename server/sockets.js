const logger = require('./logger.js');
const storage = require('./datamodel/interface')
function generateID(length) {
	if (length < 1) return(-1);
	return(Math.floor((10 ** length) + Math.random() * (10 ** (length - 1) * 9)));
}

module.exports = {
	connect: (io, PORT) => {
		io.on('connection', (socket) => {
			logger.log('sock', `[ ${socket.id} ] connected.`);

			socket.on('message', async (message) => {
				logger.log('evnt', `${message?.author || socket.id} MESG ${message.group}::${message.channel}`);
				io.emit('message', {
					group: message.group,
					channel: message.channel,
					id: message.id,
					text: message.text,
					image: message.image,
					author: await storage.getUser(message.author) || null,
					date: Date.now()
				});
			});

			socket.on('group_change', () => {
				logger.log('evnt', `[ ${socket.id} ] notifying of group change.`);
				io.emit('group_change', generateID(10));
			});

			socket.on('disconnect', () => {
				logger.log('sock', `[ ${socket.id} ] disconnected.`)
			});
			return;
		});
	}
}