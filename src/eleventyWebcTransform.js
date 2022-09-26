module.exports = function(eleventyConfig, options = {}) {
	let componentsMap = false; // cache the glob search

	eleventyConfig.addTransform("eleventy-plugin-webc", async function(content) {
		// Skip .webc input or non-.html output
		if(this.inputPath.endsWith(".webc") || !this.outputPath?.endsWith(".html")) {
			return content;
		}

		try {
			const { WebC } = await import("@11ty/webc");
			let page = new WebC();

			if(componentsMap === false && options.components) {
				componentsMap = WebC.getComponentsMap(options.components); // "./_includes/webc/*.webc"
			}

			page.defineComponents(componentsMap);
			page.setContent(content, this.outputPath);

			let { html } = await page.compile({
				// global data
				data: options.data // { pkg: require("../package.json") }
			});
			return html;
		} catch(e) {
			console.error( `[11ty/eleventy-plugin-webc] Error transforming ${this.inputPath}`, e );
		}

		return content;
	});
}