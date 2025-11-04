const path = require("node:path");
const debug = require("debug")("Eleventy:WebC");

const { evaluateInlineCode } = require("./dynamicScript.js");

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
	let scopedHelpers = new Set(options.scopedHelpers);

	eleventyConfig.on("eleventy.before", async () => {
		// Temporary workaround for ESM in CJS
		let { WebC, ComponentManager } = await import("@11ty/webc");
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

	eleventyConfig.addExtension("webc", {
		outputFileExtension: "html",

		compileOptions: {
			permalink: function(contents, inputPath) {
				if(contents && typeof contents === "string") {
					return async (data) => {
						let combinedContextData = {
							...this,
							...data,
						};

						// Hard to know if this is JavaScript code or just a raw string value.
						return evaluateInlineCode(contents, {
							filePath: inputPath,
							context: combinedContextData,
							data: combinedContextData,
						}).catch(e => {
							debug("Error evaluating dynamic permalink, returning raw string contents instead: %o\n%O", contents, e);
							return contents;
						});
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
			page.setHelper("getCss", (url, bucket) => this.config.javascriptFunctions.getBundle("css", bucket, url), scopedHelpers.has("getCss"));
			page.setHelper("getCSS", (url, bucket) => this.config.javascriptFunctions.getBundle("css", bucket, url), scopedHelpers.has("getCSS"));

			page.setHelper("getJs", (url, bucket) => this.config.javascriptFunctions.getBundle("js", bucket, url), scopedHelpers.has("getJs"));
			page.setHelper("getJS", (url, bucket) => this.config.javascriptFunctions.getBundle("js", bucket, url), scopedHelpers.has("getJS"));

			page.setTransform("11ty", async function(content) {
				let syntax = this["11ty:type"];
				if(syntax) {
					const { RenderPlugin } = await import("@11ty/eleventy");
					const CompileString = RenderPlugin.String;

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

				if(options.after && typeof options.after === "function") {
					await options.after(page, { html, css, js, buckets, components });
				}

				return html;
			};
		}
	});
};
