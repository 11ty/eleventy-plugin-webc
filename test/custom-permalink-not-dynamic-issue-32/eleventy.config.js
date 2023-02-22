const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addGlobalData("dynamicPermalink", false);
	eleventyConfig.addGlobalData("permalink", "page.html");

	eleventyConfig.addPlugin(EleventyWebcPlugin);
}
