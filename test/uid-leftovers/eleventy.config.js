const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");

let i = 0;

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		before: (component) => {
			component.setUidFunction(function() {
				return `webc-${i++}`;
			});
		}
	});

	return {
		dir: {
			includes: "_includes",
			layouts: "_layouts",
		}
	}
}
