const pkg = require("./package.json");
const templatePlugin = require("./src/eleventyWebcTemplate.js");
const transformPlugin = require("./src/eleventyWebcTransform.js");

module.exports = function(eleventyConfig, options = {}) {
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
	}, options);

	options.bundlePluginOptions = Object.assign({
		hoistDuplicateBundlesFor: ["css", "js"]
	}, options.bundlePluginOptions);

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

	// v0.12.0 upstream
	// `bundlePluginOptions.toFileDirectory` (via Bundle Plugin changes) default changed from "bundle" to ""
	// https://github.com/11ty/eleventy-plugin-bundle/releases/tag/v2.0.0

	eleventyConfig.addBundle("html", Object.assign({}, options.bundlePluginOptions, {
		hoist: options.bundlePluginOptions.hoistDuplicateBundlesFor.includes("html"),
	}));
	eleventyConfig.addBundle("css", Object.assign({}, options.bundlePluginOptions, {
		hoist: options.bundlePluginOptions.hoistDuplicateBundlesFor.includes("css"),
	}));
	eleventyConfig.addBundle("js", Object.assign({}, options.bundlePluginOptions, {
		hoist: options.bundlePluginOptions.hoistDuplicateBundlesFor.includes("js")
	}));

	templatePlugin(eleventyConfig, options);

	if(options.useTransform) {
		transformPlugin(eleventyConfig, options);
	}
}
