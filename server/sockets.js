const logger = require('./logger.js');
const storage = require('./datamodel/interface')
function generateID(length) {
	if (length < 1) return(-1);
	return(Math.floor((10 ** length) + Math.random() * (10 ** (length - 1) * 9)));
}

const getUser = (id) => {
	let user = storage.getTable("users").find(user => user.id == id);
	if (!user) return({"username": ""});

	return(user);
}

module.exports = {
	connect: (io, PORT) => {
		io.on('connection', (socket) => {
			logger.log('sock', `[ ${socket.id} ] connected.`);

			socket.on('message', (message) => {
				logger.log('evnt', `${message?.author || socket.id} MESG ${message.group}::${message.channel}`);
				io.emit('message', {
					group: message.group,
					channel: message.channel,
					id: message.id,
					text: message.text,
					image: message.image,
					author: getUser(message.author),
					date: Date.now()
				});
			});

			socket.on('group_change', () => {
				logger.log('evnt', `${socket.id} Group changed.`);
				io.emit('group_change', generateID(10));
			});

			socket.on('disconnect', () => {
				logger.log('sock', `[ ${socket.id} ] disconnected.`)
			});
			return;
		});
	}
}