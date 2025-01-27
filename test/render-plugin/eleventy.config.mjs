import WebcPlugin from "../../eleventyWebcPlugin.js";
import { RenderPlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(WebcPlugin, {
		components: "./test/render-plugin/webc/*.webc"
	});

	eleventyConfig.addPlugin(RenderPlugin);
}
