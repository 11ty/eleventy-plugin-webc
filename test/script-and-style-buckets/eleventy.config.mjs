import { RenderPlugin } from "@11ty/eleventy";
import WebcPlugin from "../../eleventyWebcPlugin.js";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(RenderPlugin);
	eleventyConfig.addPlugin(WebcPlugin, {
		components: "test/script-and-style-buckets/_components/**/*.webc"
	});
	// eleventyConfig.addPlugin(eleventyConfig => {
	// 	console.log( eleventyConfig.javascriptFunctions );
	// })

	return {
		dir: {
			includes: "_includes",
			layouts: "_layouts",
		}
	}
}
