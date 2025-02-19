const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		components: "./test/sample-non-webc-layout/_includes/*.webc"
	});

	return {
		dir: {
			includes: "_includes",
			layouts: "_layouts",
		}
	}
}
