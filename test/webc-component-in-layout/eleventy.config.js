const { EleventyRenderPlugin } = require("@11ty/eleventy");
const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(EleventyRenderPlugin);

	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		components: "./test/webc-component-in-layout/_components/*.webc"
	});

	return {
		dir: {
			includes: "_includes",
		}
	}
}
