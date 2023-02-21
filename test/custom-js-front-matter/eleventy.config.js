const EleventyWebcPlugin = require("../../eleventyWebcPlugin.js");
const { RetrieveGlobals } = require("node-retrieve-globals");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyWebcPlugin, {
		components: false,
	});

	// via https://github.com/11ty/demo-eleventy-js-front-matter
	eleventyConfig.setFrontMatterParsingOptions({
		engines: {
			"javascript": function(frontMatterCode) {
				let vm = new RetrieveGlobals(frontMatterCode);

				let data = {}; // want to pass in data available in front matter?
				return vm.getGlobalContext(data, {
					reuseGlobal: true,
					dynamicImport: true,
				});
			}
		}
	});
}
