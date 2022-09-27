module.exports = function(eleventyConfig, options = {}) {
	let componentsMap = false; // cache the glob search

	eleventyConfig.on("eleventy.before", () => {
		componentsMap = false;
	});

	eleventyConfig.addTransform("@11ty/eleventy-plugin-webc", async function(content) {
		// Skip non-.html output
		// Skip .webc input
		if(this.inputPath.endsWith(".webc") || !this.outputPath?.endsWith(".html")) {
			return content;
		}

		// TODO prevent double processing with the Render plugin with WebC
		// https://www.11ty.dev/docs/plugins/render/
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
				data: options.transformData
			});
			return html;
		} catch(e) {
			console.error( `[11ty/eleventy-plugin-webc] Error transforming ${this.inputPath}`, e );
			throw e;
		}

		return content;
	});
}