const pkg = require("./package.json");
const templatePlugin = require("./src/eleventyWebcTemplate.js");
const transformPlugin = require("./src/eleventyWebcTransform.js");

module.exports = async function(eleventyConfig, options = {}) {
	eleventyConfig.versionCheck(pkg["11ty"].compatibility);

	// Error for removed filters.
	eleventyConfig.addFilter("webcGetCss", () => {
		throw new Error("webcGetCss was removed from @11ty/eleventy-plugin-webc. Use the `getBundle('css')` shortcode instead.")
	});

	// Error for removed filters.
	eleventyConfig.addFilter("webcGetJs", () => {
		throw new Error("webcGetJs was removed from @11ty/eleventy-plugin-webc. Use the `getBundle('js')` shortcode instead.")
	})


	options = Object.assign({
		components: "_components/**/*.webc", // glob for no-import global components
		scopedHelpers: ["css", "js", "html"],
		useTransform: false, // global transform
		transformData: {}, // extra global data for transforms specifically
		bundlePluginOptions: {},
	}, options);

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

	// v0.13.0 `options.bundlePluginOptions` because Bundle Plugin@2 for Eleventy v3.0.0
	// v0.13.0 Upstream `toFileDirectory` default changed from "bundle" to ""
	let htmlBundleOptions = Object.assign({}, options.bundlePluginOptions, {
		hoist: false, // don’t hoist
	});

	eleventyConfig.addBundle("html", htmlBundleOptions);
	eleventyConfig.addBundle("css", options.bundlePluginOptions);
	eleventyConfig.addBundle("js", options.bundlePluginOptions);

	templatePlugin(eleventyConfig, options);

	if(options.useTransform) {
		transformPlugin(eleventyConfig, options);
	}
}
