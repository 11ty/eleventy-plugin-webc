const { EleventyRenderPlugin } = require("@11ty/eleventy");
const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyRenderPlugin);
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		components: "test/script-and-style-buckets/_components/**/*.webc"
	});

	return {
		dir: {
			includes: "_includes",
			layouts: "_layouts",
		}
	}
}
