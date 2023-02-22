const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addGlobalData("permalink", () => ((data) => `${data.page.filePathStem}.html`));

	eleventyConfig.addPlugin(EleventyWebcPlugin);
}
