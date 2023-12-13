const path = require("path");
const debug = require("debug")("Eleventy:WebC");

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

function addContextToJavaScriptFunction(data, fn) {
	let CONTEXT_KEYS = ["eleventy", "page"];
	return function (...args) {
		for (let key of CONTEXT_KEYS) {
			if (data && data[key]) {
				this[key] = data[key];
			}
		}

		return fn.call(this, ...args);
	};
}

module.exports = function(eleventyConfig, options = {}) {
	// TODO remove this when WebC is moved out of plugin-land into core.
	eleventyConfig.addTemplateFormats("webc");

	let _WebC;
	let globalComponentManager;
	let componentsMap = false; // cache the glob search
	let moduleScript;
	let scopedHelpers = new Set(options.scopedHelpers);

	eleventyConfig.on("eleventy.before", async () => {
		// For ESM in CJS
		let { WebC, ModuleScript, ComponentManager } = await import("@11ty/webc");
		moduleScript = ModuleScript;
		_WebC = WebC;
		globalComponentManager = new ComponentManager();

		if(options.components) {
			componentsMap = WebC.getComponentsMap(options.components); // second argument is ignores here
		}
	});

	let templateConfig;
  eleventyConfig.on("eleventy.config", (cfg) => {
    templateConfig = cfg;
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
							}, `Check the permalink for ${inputPath}`, "eleventyWebcPermalink:" + inputPath);
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

			page.setGlobalComponentManager(globalComponentManager);
			page.setBundlerMode(true);
			page.setContent(inputContent, inputPath);

			if(componentsMap) {
				page.defineComponents(componentsMap);
			}

			// Support both casings (I prefer getCss, but yeah)
			page.setHelper("getCss", (url, bucket) => this.config.javascriptFunctions.getBundle("css", bucket), scopedHelpers.has("getCss"));
			page.setHelper("getCSS", (url, bucket) => this.config.javascriptFunctions.getBundle("css", bucket), scopedHelpers.has("getCSS"));

			page.setHelper("getJs", (url, bucket) => this.config.javascriptFunctions.getBundle("js", bucket), scopedHelpers.has("getJs"));
			page.setHelper("getJS", (url, bucket) => this.config.javascriptFunctions.getBundle("js", bucket), scopedHelpers.has("getJS"));

			page.setTransform("11ty", async function(content) {
				let syntax = this["11ty:type"];
				if(syntax) {
					const { EleventyRenderPlugin } = await import("@11ty/eleventy");
					const CompileString = EleventyRenderPlugin.String;

					let fn = await CompileString(content, syntax, {
						templateConfig
					});
					return fn(this);
				}
				return content;
			});

			// Render function
			return async (data) => {
				// Add Eleventy JavaScript Functions as WebC helpers
				// Note that Universal Filters and Shortcodes populate into javascriptFunctions and will be present here
				for(let helperName in this.config.javascriptFunctions) {
					let helperFunction = addContextToJavaScriptFunction(data, this.config.javascriptFunctions[helperName]);
					page.setHelper(helperName, helperFunction, scopedHelpers.has(helperName));
				}

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
