const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		components: "./test/sample-html-preprocess/_includes/*.webc",
	});

	return {
		dir: {
			includes: "_includes",
		},
		htmlTemplateEngine: "webc"
	}
}
