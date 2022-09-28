const pkg = require("./package.json");
const templatePlugin = require("./src/eleventyWebcTemplate.js");
const transformPlugin = require("./src/eleventyWebcTransform.js");

module.exports = function(eleventyConfig, options = {}) {
	try {
		eleventyConfig.versionCheck(pkg["11ty"].compatibility);
	} catch(e) {
		console.log( `WARN: Eleventy Plugin (${pkg.name}) Compatibility: ${e.message}` );
	}

	let filters = Object.assign({
		css: "webcGetCss",
		js: "webcGetJs",
	}, options.filters);

	options = Object.assign({
		components: false, // glob for no-import global components
		useTransform: false, // global transform
		transformData: {}, // extra global data for transforms specifically
	}, options);

	options.filters = filters;

	if(options.components) {
		eleventyConfig.addWatchTarget(options.components);

		// TODO add to eleventy ignores (if not in _includes folder)
	}

	templatePlugin(eleventyConfig, options);

	if(options.useTransform) {
		transformPlugin(eleventyConfig, options);
	}
}
