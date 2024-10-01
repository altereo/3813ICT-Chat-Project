var enabled = true;

const log = (type, str) => {
	if (!enabled) return;
	let time = new Date(Date.now()).toLocaleString('en-GB').replaceAll('/', '-').replaceAll(',', '');
	return(console.log(`\x1b[90m${time}\x1b[97m ${type.toUpperCase()}: ${str}`));
}

module.exports = {
	log,
	disable: () => enabled = false
};