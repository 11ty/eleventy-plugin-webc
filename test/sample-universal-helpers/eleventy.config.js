const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin);
	eleventyConfig.addFilter("testing", function(arg) {
		return arg + "Always return this" + this.page.url
	});

	return {
		dir: {
			includes: "_includes",
			layouts: "_layouts",
		}
	}
}
