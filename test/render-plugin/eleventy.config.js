const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");
const { EleventyRenderPlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		components: "./test/render-plugin/webc/*.webc"
	});

	eleventyConfig.addPlugin(EleventyRenderPlugin);
}
