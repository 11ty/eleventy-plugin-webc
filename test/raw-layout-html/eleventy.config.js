const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		components: "test/raw-layout-html/_includes/*.webc"
	});

	return {
		dir: {
			includes: "_includes",
			layouts: "_layouts",
		}
	}
}
