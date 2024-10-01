var assert = require('assert');
var app = require('../app.js').app;

let chai = require('chai');
let chaiHTTP = require('chai-http');
let should = chai.should();
chai.use(chaiHTTP);

let userProfile; // For storing creds.
let userGroups; // For storing groups.
let targetGroup; // target group for testing.

describe('Server Unit Test', () => {
	before((done) => {
		require('../app.js').init(done, true); // Wait for server to be ready.
	});

	after((done) => {
		require('../app.js').stop(done); // Send SIGINT to server when done.
	})

	describe('POST Account Auth Test', () => {
		it('Should respond with status OK', (done) => {
			chai.request(app)
				.post('/api/auth').type('json').send({
					email: "admin@gmail.com",
					password: "123"
				})
				.end((err, res) => {
					res.body.status.should.equal("OK");
					done();
				})
		});

		it('Should respond with boolean \'valid\' true', (done) => {
			chai.request(app)
				.post('/api/auth').type('json').send({
					email: "admin@gmail.com",
					password: "123"
				})
				.end((err, res) => {
					res.body.user.valid.should.equal(true);
					userProfile = {...res.body.user};
					done();
				})
		});
	});

	describe('GET User Groups Test', () => {
		it('Should respond with status OK', (done) => {
			chai.request(app)
				.get(`/api/chat/groups/${userProfile.id}`)
				.end((err, res) => {
					res.body.status.should.equal("OK");
					done();
				})
		});

		it('Should return a list', (done) => {
			chai.request(app)
				.get(`/api/chat/groups/${userProfile.id}`)
				.end((err, res) => {
					res.body.groups.should.be.a('array');
					userGroups = [...res.body.groups];
					done();
				})
		});
	});

	describe('POST Create Group Test', () => {
		let response;

		before((done) => {
			chai.request(app)
				.post('/api/chat/group/create').type('json').send({
					name: `TESTGROUP-${Date.now()}`,
					executor: +`${userProfile.id}`
				})
				.end((err, res) => {
					response = res;
					if (!err) done();
				})
		})
		it('Should respond with status OK', (done) => {
			response.body.status.should.equal("OK");
			done();
		});

		it('Should respond with Group ID', (done) => {
			response.body.message.should.be.a('number');

			targetGroup = {
				'id': response.body.message
			}
			done();
		});
	})

	describe('GET Group Details Test', () => {
		it('Should respond with status OK', (done) => {
			chai.request(app)
				.get(`/api/chat/group/${targetGroup.id}`)
				.end((err, res) => {
					res.body.status.should.equal("OK");
					done();
				})
		});

		it('Should respond with a group object', (done) => {
			chai.request(app)
				.get(`/api/chat/group/${targetGroup.id}`)
				.end((err, res) => {
					res.body.group.id.should.be.a('number');
					res.body.group.name.should.be.a('string');
					res.body.group.channels.should.be.a('array');
					res.body.group.users.should.be.a('array');
					res.body.group.joinRequests.should.be.a('array');
					res.body.group.creator.should.be.a('number');

					targetGroup = {...res.body.group};
					done();
				})
		});
	});

	describe('POST Remove User from Group Test', () => {
		it('Should respond with status ERROR on missing parameters', (done) => {
			chai.request(app)
				.post('/api/chat/group/remove').type('json').send({
					executor: userProfile.id
				})
				.end((err, res) => {
					res.body.status.should.equal("ERROR");
					done();
				})
		})
	});

	describe('POST Retrieve Messages Test', () => {
		it('Should respond with status OK', (done) => {
			chai.request(app)
				.post('/api/chat/group/messages').type('json').send({
					group: targetGroup.id,
					channel: targetGroup.channels[0].id,
					before: ""
				})
				.end((err, res) => {
					res.body.status.should.equal("OK");
					done();
				})

		});

		it('Should respond with an array', (done) => {
			chai.request(app)
				.post('/api/chat/group/messages').type('json').send({
					group: targetGroup.id,
					channel: targetGroup.channels[0].id,
					before: ""
				})
				.end((err, res) => {
					res.body.messages.should.be.a('array');
					done();
				})

		});
	});

	describe('POST Rename Group Test', () => {
		it('Should respond with ERROR on empty name', (done) => {
			chai.request(app)
				.post('/api/chat/group/rename').type('json').send({
					group: targetGroup.id,
					newName: "",
					executor: userProfile.id
				})
				.end((err, res) => {
					res.body.status.should.equal("ERROR");
					done();
				})
		});

		it('Should respond with status OK', (done) => {
			chai.request(app)
				.post('/api/chat/group/rename').type('json').send({
					group: targetGroup.id,
					newName: `TESTGROUP-${Date.now()}`,
					executor: userProfile.id
				})
				.end((err, res) => {
					res.body.status.should.equal("OK");
					done();
				})
		})
	})

	describe('POST Remove Group Test', () => {
		it('Should respond with status OK', (done) => {
			chai.request(app)
				.post('/api/chat/group/delete').type('json').send({
					group: targetGroup.id,
					executor: userProfile.id
				})
				.end((err, res) => {
					res.body.status.should.equal("OK");
					done();
				})
		});
	});

	describe('GET User Username Test', () => {
		it('Should respond with status OK', (done) => {
			chai.request(app)
				.get(`/api/chat/users/username/${userProfile.id}`)
				.end((err, res) => {
					res.body.status.should.equal("OK");
					done();
				})
		});

		it('Should retrieve correct username', (done) => {
			chai.request(app)
				.get(`/api/chat/users/username/${userProfile.id}`)
				.end((err, res) => {
					res.body.username.should.be.a('string');
					res.body.username.should.equal(userProfile.username);
					done();
				})
		});
	});

	describe('GET User Roles Test', () => {
		it('Should respond with status OK', (done) => {
			chai.request(app)
				.get(`/api/chat/users/roles/${userProfile.id}`)
				.end((err, res) => {
					res.body.status.should.equal("OK");
					done();
				})
		});

		it('Should respond with an array', (done) => {
			chai.request(app)
				.get(`/api/chat/users/roles/${userProfile.id}`)
				.end((err, res) => {
					res.body.roles.should.be.a('array');
					done();
				})
		});
	});

	describe('GET WebRTC Server Status Test', () => {
		it('Should respond with PeerJS Signaling Server', (done) => {
			chai.request(app)
				.get('/peerserv')
				.end((err, res) => {
					res.body.name.should.equal("PeerJS Server");
					res.body.description.should.be.a('string');
					res.body.website.should.be.a('string');
					done();
				})
		});
	});

	describe('GET WebRTC Peers Test', () => {
		it('Should respond with status ERROR', (done) => {
			chai.request(app)
				.get(`/peerserv/peers/${targetGroup.id}/${targetGroup.channels[0].id}`)
				.end((err, res) => {
					res.body.status.should.equal("ERROR");
					done();
				})
		});
	});
})
