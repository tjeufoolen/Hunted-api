const slugify = require('slugify')

class Slugger {
	create(msg) {
		return slugify(msg, {
			lower: true,
			replacement: '_'
		});
	}
}

module.exports = new Slugger();