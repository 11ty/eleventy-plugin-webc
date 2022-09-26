const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		components: "test/sample-transform/_includes/*.webc",
		useTransform: true,
	});

	return {
		dir: {
			includes: "_includes",
		}
	}
}