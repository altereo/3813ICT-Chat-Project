const logger = require('./logger.js');
const storage = require('./datamodel/interface');
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
				let messageAuthor = await storage.getUser(message.author);

				await storage.storeMessage(message.group, message.channel, {
					group: message.group,
					channel: message.channel,
					id: message.id,
					text: message.text,
					image: message.image,
					author: message.author,
					date: new Date(Date.now())
				});

				io.emit('message', {
					group: message.group,
					channel: message.channel,
					id: message.id,
					text: message.text,
					image: message.image,
					author: messageAuthor || null,
					date: new Date(Date.now())
				});
			});

			socket.on('group_change', () => {
				logger.log('evnt', `[ ${socket.id} ] notifying of group change.`);
				io.emit('group_change', generateID(10));
			});

			socket.on('channel_update', (id) => {
				logger.log('evnt', `[ ${socket.id} ] notifying of channel change.`);
				io.emit('channel_update', generateID(8));
			})

			socket.on('call_change', (data) => {
				logger.log('evnt', `[ ${socket.id} ] call started or stopped.`);
				io.emit('call_change', data);
			})

			socket.on('disconnect', () => {
				logger.log('sock', `[ ${socket.id} ] disconnected.`)
			});
			return;
		});
	}
}