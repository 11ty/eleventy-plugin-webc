const eleventyBundlePlugin = require("@11ty/eleventy-plugin-bundle");
const pkg = require("./package.json");
const templatePlugin = require("./src/eleventyWebcTemplate.js");
const transformPlugin = require("./src/eleventyWebcTransform.js");

module.exports = function(eleventyConfig, options = {}) {
	try {
		eleventyConfig.versionCheck(pkg["11ty"].compatibility);
	} catch(e) {
		console.log( `WARN: Eleventy Plugin (${pkg.name}) Compatibility: ${e.message}` );
	}

	// Deprecated: this lives in @11ty/eleventy-plugin-bundle now
	let filters = Object.assign({
		css: "webcGetCss",
		js: "webcGetJs",
	}, options.filters);

	options = Object.assign({
		components: "_components/**/*.webc", // glob for no-import global components
		scopedHelpers: ["css", "js", "html"],
		useTransform: false, // global transform
		transformData: {}, // extra global data for transforms specifically
	}, options);

	options.bundlePluginOptions = Object.assign({
		hoistDuplicateBundlesFor: ["css", "js"]
	}, options.bundlePluginOptions);

	// Deprecated: this lives in @11ty/eleventy-plugin-bundle now
	options.filters = filters;

	if(options.components) {
		let components = options.components;
		if(!Array.isArray(components)) {
			components = [components];
		}

		for(let entry of components) {
			if(entry.startsWith("npm:")) {
				continue;
			}

			eleventyConfig.addWatchTarget(entry);

			// Opt-out of Eleventy to process components
			// Note that Eleventy’s default ignores already have _includes/**

			// This will cause component files outside of _includes to not be watched: https://github.com/11ty/eleventy-plugin-webc/issues/29
			// Fixed in @11ty/eleventy@2.0.0-canary.18: https://github.com/11ty/eleventy/issues/893
			eleventyConfig.ignores.add(entry);
		}
	}

	// TODO Remove this when @11ty/eleventy-plugin-bundle is moved to core.
	// If the bundle plugin has not been added, we add it here:
	let bundlePlugin = eleventyConfig.plugins.find(entry => entry.plugin.eleventyPackage === "@11ty/eleventy-plugin-bundle");
	if(!bundlePlugin) {
		eleventyConfig.addPlugin(eleventyBundlePlugin, options.bundlePluginOptions);
	}

	templatePlugin(eleventyConfig, options);

	if(options.useTransform) {
		transformPlugin(eleventyConfig, options);
	}
}
