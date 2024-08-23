const users = [
	{
		"email": "evan.lee@gmail.com",
		"username": "Superadmin",
		"password": "123",
		"roles": ["SUPERADMIN"],
		"groups": [0],
		"id": 914976000
	}
];

const tableSet = {
	users
};

function getTable(type) {
	return(tableSet?.users);
}

module.exports = { getTable };