const log = (type, str) => {
	let time = new Date(Date.now()).toLocaleString('en-GB').replaceAll('/', '-').replaceAll(',', '');
	return(console.log(`\x1b[90m${time}\x1b[97m ${type.toUpperCase()}: ${str}`));
}

exports.log = log;