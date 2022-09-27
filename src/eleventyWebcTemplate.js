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

	eleventyConfig.on("eleventy.before", () => {
		cssManager.reset();
		jsManager.reset();
		incremental.setComponents(options.components);
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

		init: async function() {
			// For ESM in CJS
			let { WebC } = await import("@11ty/webc");
			incremental.setWebC(WebC);

			if(incremental.needsComponents()) {
				incremental.setComponents(options.components);
			}
		},

		isIncrementalMatch: function (incrementalFilePath) {
			// Eleventy layouts don’t appear directly in the WebC component graph, so we use the `eleventy.layouts` map here
			if(incremental.isTemplateUsingLayout(this.inputPath, incrementalFilePath)) {
				return true;
			}

			let {page, setup} = incremental.get(this.inputPath);
			if(page && setup) {
				if(page.getComponents(setup).includes(incrementalFilePath)) {
					return true;
				}
			}

			return false;
		},

		compile: async function(inputContent, inputPath) {
			let page = incremental.add(inputContent, inputPath);

			// TODO add all universal filters/JavaScript functions as helpers here:

			page.setHelper("getCSS", function(url, bucket) {
				return getCss(url, bucket);
			});

			page.setHelper("getJS", function(url, bucket) {
				return getJs(url, bucket);
			});

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
					setupObject.components = incremental.getComponentMap(relativePath(data.page.inputPath, data.webc.components));
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