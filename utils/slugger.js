const slugify = require('slugify')

exports.createSlug = (msg) => {
	return slugify(msg, {
		lower: true,
		replacement: '_'
	});
};