const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
    components: "test/global-data/_includes/**/*.webc"
  });
  // eleventyConfig.addPlugin(EleventyWebcPlugin);

	return {
		dir: {
			data: "_data",
			includes: "_includes",
			layouts: "_layouts",
		}
	}
}
