const path = require("path");
const debug = require("debug")("Eleventy:WebC");


const { EleventyRenderPlugin } = require("@11ty/eleventy");
const CompileString = EleventyRenderPlugin.String;

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
	// TODO remove this when WebC is moved out of plugin-land into core.
	eleventyConfig.addTemplateFormats("webc");

	let _WebC;
	let componentsMap = false; // cache the glob search
	let moduleScript;

	eleventyConfig.on("eleventy.before", async () => {
		// For ESM in CJS
		let { WebC, ModuleScript } = await import("@11ty/webc");
		moduleScript = ModuleScript;
		_WebC = WebC;

		if(options.components) {
			componentsMap = WebC.getComponentsMap(options.components);
		}
	});

	// Deprecated (backwards compat only): this lives in @11ty/eleventy-plugin-bundle now
	if(options.filters.css) {
		eleventyConfig.addFilter(options.filters.css, (url, bucket) => {
			return eleventyConfig.javascriptFunctions.getBundle("css", bucket);
		});
	}

	// Deprecated (backwards compat only): this lives in @11ty/eleventy-plugin-bundle now
	if(options.filters.js) {
		eleventyConfig.addFilter(options.filters.js, (url, bucket) => {
			return eleventyConfig.javascriptFunctions.getBundle("js", bucket)
		});
	}

	eleventyConfig.addExtension("webc", {
		outputFileExtension: "html",

		compileOptions: {
			permalink: function(contents, inputPath) {
				if(contents && typeof contents === "string") {
					return async (data) => {
						try {
							// Hard to know if this is JavaScript code or just a raw string value.
							let evaluatedString = await moduleScript.evaluateScript(contents, {
								...this,
								...data,
							}, `Check the permalink for ${inputPath}`);
							return evaluatedString;
						} catch(e) {
							debug("Error evaluating dynamic permalink, returning raw string contents instead: %o\n%O", contents, e);
							return contents;
						}
					}
				}

				return contents;
			}
		},

		compile: async function(inputContent, inputPath) {
			let page = new _WebC();

			page.setBundlerMode(true);
			page.setContent(inputContent, inputPath);

			if(componentsMap) {
				page.defineComponents(componentsMap);
			}

			// Add Eleventy JavaScript Functions as WebC helpers
			// Note that Universal Filters and Shortcodes populate into javascriptFunctions and will be present here
			for(let helperName in this.config.javascriptFunctions) {
				page.setHelper(helperName, this.config.javascriptFunctions[helperName]);
			}

			// Support both casings (I prefer getCss, but yeah)
			page.setHelper("getCss", (url, bucket) => this.config.javascriptFunctions.getBundle("css", bucket));
			page.setHelper("getCSS", (url, bucket) => this.config.javascriptFunctions.getBundle("css", bucket));

			page.setHelper("getJs", (url, bucket) => this.config.javascriptFunctions.getBundle("js", bucket));
			page.setHelper("getJS", (url, bucket) => this.config.javascriptFunctions.getBundle("js", bucket));

			page.setTransform("11ty", async function(content) {
				let syntax = this["11ty:type"];
				if(syntax) {
					let fn = await CompileString(content, syntax, {
						templateConfig: eleventyConfig
					});
					return fn(this);
				}
				return content;
			});

			return async (data) => {
				let setupObject = {
					data,
				};

				if(data.webc?.components) {
					setupObject.components = _WebC.getComponentsMap(relativePath(data.page.inputPath, data.webc.components));
				}

				if(options.before && typeof options.before === "function") {
					await options.before(page);
				}

				let { html, css, js, buckets, components } = await page.compile(setupObject);

				// 2.0.0-canary.19+
				this.addDependencies(inputPath, components);

				// Add CSS to bundle
				this.config.javascriptFunctions.css(css, "default", data.page.url);

				if(buckets.css) {
					for(let bucket in buckets.css) {
						this.config.javascriptFunctions.css(buckets.css[bucket], bucket, data.page.url);
					}
				}

				// Add JS to bundle
				this.config.javascriptFunctions.js(js, "default", data.page.url);

				if(buckets.js) {
					for(let bucket in buckets.js) {
						this.config.javascriptFunctions.js(buckets.js[bucket], bucket, data.page.url);
					}
				}

				return html;
			};
		}
	});
};
