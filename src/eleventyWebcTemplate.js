const path = require("path");

const { EleventyRenderPlugin } = require("@11ty/eleventy");
const EleventyRenderManager = EleventyRenderPlugin.RenderManager;

const CodeManager = require("./codeManager.js");
const WebCIncremental = require("./incremental.js");

function relativePath(inputPath, newGlob) {
	// project root
	if(newGlob.startsWith("~/")) {
		let rootRelativePath = "." + newGlob.slice(1);
		return rootRelativePath;
	}

	let { dir } = path.parse(inputPath);
	// globs must have forward slashes (even on Windows)
	let templateRelativePath = path.join(dir, newGlob).split(path.sep).join("/");
	return templateRelativePath;
}

module.exports = function(eleventyConfig, options = {}) {
	eleventyConfig.addTemplateFormats("webc");

	let renderManager = new EleventyRenderManager();
	let cssManager = new CodeManager();
	let jsManager = new CodeManager();
	let incremental = new WebCIncremental();
	let componentsMap = false; // cache the glob search
	let componentsMapKey;

	eleventyConfig.on("eleventy.before", async () => {
		cssManager.reset();
		jsManager.reset();

		// For ESM in CJS
		let { WebC } = await import("@11ty/webc");
		incremental.setWebC(WebC);

		if(options.components) {
			componentsMap = WebC.getComponentsMap(options.components);
			componentsMapKey = JSON.stringify(componentsMap);
		}
	});

	function getCss(pageUrl, bucket = "default") {
		return cssManager.getForPage(pageUrl, bucket);
	}

	function getJs(pageUrl, bucket = "default") {
		return jsManager.getForPage(pageUrl, bucket);
	}

	if(options.filters.css) {
		eleventyConfig.addFilter(options.filters.css, (url, bucket) => getCss(url, bucket));
	}
	if(options.filters.js) {
		eleventyConfig.addFilter(options.filters.js, (url, bucket) => getJs(url, bucket));
	}

	eleventyConfig.on("eleventy.layouts", layouts => {
		incremental.setLayouts(layouts);
	});

	eleventyConfig.addExtension("webc", {
		outputFileExtension: "html",

		isIncrementalMatch: function (incrementalFilePath) {
			// Eleventy layouts don’t appear directly in the WebC component graph, so we use the `eleventy.layouts` map here
			if(incremental.isTemplateUsingLayout(this.inputPath, incrementalFilePath)) {
				return true;
			}

			let {page, setup} = incremental.get(this.inputPath);
			if(page && setup) {
				let components = page.getComponents(setup);
				if(components.includes(incrementalFilePath)) {
					return true;
				}
			}

			return false;
		},

		compileOptions: {
			cache: true,
			getCacheKey: function(contents, inputPath) {
				// if global components change, recompile!
				return contents + inputPath + componentsMapKey;
			}
		},

		compile: async function(inputContent, inputPath) {
			let page = incremental.add(inputContent, inputPath);

			if(componentsMap) {
				page.defineComponents(componentsMap);
			}

			// Add Eleventy JavaScript Functions as WebC helpers (Universal Filters also populate into these)
			for(let helperName in this.config.javascriptFunctions) {
				page.setHelper(helperName, this.config.javascriptFunctions[helperName]);
			}

			// Support both casings (I prefer getCss, but yeah)
			page.setHelper("getCss", (url, bucket) => getCss(url, bucket));
			page.setHelper("getCSS", (url, bucket) => getCss(url, bucket));

			page.setHelper("getJs", (url, bucket) => getJs(url, bucket));
			page.setHelper("getJS", (url, bucket) => getJs(url, bucket));

			page.setTransform("11ty", async function(content) {
				let syntax = this["11ty:type"];
				if(syntax) {
					let fn = await renderManager.compile(content, syntax);
					return renderManager.render(fn, this, {});
				}
				return content;
			});

			return async (data) => {
				let setupObject = { data };
				if(data.webc?.components) {
					let WebC = incremental.webc;
					setupObject.components = WebC.getComponentsMap(relativePath(data.page.inputPath, data.webc.components));
				}

				let setup = await page.setup(setupObject);
				incremental.addSetup(inputPath, setup);

				let { ast, serializer } = setup;
				let { html, css, js, buckets } = await serializer.compile(ast);

				cssManager.addToPage(data.page.url, css, "default");

				if(buckets.css) {
					for(let bucket in buckets.css) {
						cssManager.addToPage(data.page.url, buckets.css[bucket], bucket);
					}
				}

				jsManager.addToPage(data.page.url, js, "default");

				if(buckets.js) {
					for(let bucket in buckets.js) {
						jsManager.addToPage(data.page.url, buckets.js[bucket], bucket);
					}
				}

				return html;
			};
		}
	});
};
