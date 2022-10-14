const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		useTransform: true
	});

	return {
		dir: {
			includes: "_includes",
			layouts: "_layouts",
		}
	}
}
