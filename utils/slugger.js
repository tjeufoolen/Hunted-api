const slugify = require('slugify')

class Slugger {
	create(msg) {
		return slugify(msg, {
			remove: /[*+~.()'"!:@]/g,
			lower: true,
			replacement: '_'
		});
	}
}

module.exports = new Slugger();
