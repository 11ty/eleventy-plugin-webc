const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
    components: "test/sample-2/_includes/**/*.webc"
  });
  // eleventyConfig.addPlugin(EleventyWebcPlugin);

	return {
		dir: {
			includes: "_includes",
			layouts: "_layouts",
		}
	}
}