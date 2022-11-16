const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addShortcode("testing", () => {
		// WebC in a shortcode!
		return "<undefined-component></undefined-component><say-hello></say-hello>";
	});

	eleventyConfig.addFilter("uppercase", (str) => {
		return str.toUpperCase();
	});


	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		components: "./test/shortcodes-issue-16/_components/*.webc"
	});
};
