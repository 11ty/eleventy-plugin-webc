const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin);
	eleventyConfig.addFilter("testing", (arg) => arg + "Always return this");

	return {
		dir: {
			includes: "_includes",
			layouts: "_layouts",
		}
	}
}
