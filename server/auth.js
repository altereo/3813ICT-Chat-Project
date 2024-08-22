const users = [
	{
		"email": "evan.lee@gmail.com",
		"username": "Superadmin",
		"password": "123",
		"roles": ["SUPERADMIN"],
		"groups": [],
		"id": 914976000
	}
];

const validate = (email, password) => {
	let cred = users.find(cred => cred.email === email);
	let valid = (cred && cred.password === password) || false;

	return({
		"username": valid && cred?.username || null,
		"email": valid && cred?.email || null,
		"id": valid && cred?.id || -1,
		"roles": valid && cred?.roles || [],
		"groups": valid && cred?.groups || [],
		"valid": valid
	});
};

exports.validate = validate;