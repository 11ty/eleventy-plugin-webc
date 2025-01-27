import { RenderPlugin } from "@11ty/eleventy";
import WebcPlugin from "../../eleventyWebcPlugin.js";

export default function(eleventyConfig) {
	eleventyConfig.addPlugin(RenderPlugin);

	eleventyConfig.addPlugin(WebcPlugin, {
		components: "./test/webc-component-in-layout/_components/*.webc"
	});

	return {
		dir: {
			includes: "_includes",
		}
	}
}
