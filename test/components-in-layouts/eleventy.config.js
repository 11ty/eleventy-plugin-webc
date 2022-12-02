const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		components: "test/components-in-layouts/_components/**/*.webc"
	});

	return {
		dir: {
			includes: "_includes",
		}
	}
}
