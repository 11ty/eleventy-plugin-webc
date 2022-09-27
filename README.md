<p align="center"><img src="https://www.11ty.dev/img/logo-github.svg" width="200" height="200" alt="11ty Logo"></p>

# eleventy-plugin-webc 🕚⚡️🎈🐀

Adds support for [WebC, the single file web component format](https://github.com/11ty/webc), to Eleventy.

## Features

* All of the [framework-independent WebC features](https://github.com/11ty/webc#features) out of the box.
* First-class incremental support (for page templates, components, and Eleventy layouts): use with `--incremental`
* Tired of importing components? Use our new global or per-page no-import components.
* Easily roll up the CSS and JS in-use by WebC components on a page for page-specific bundles. Dirt-simple critical CSS/JS to only load the code you need.
* For more complex templating needs, you _can_ render any existing Eleventy template syntax (Liquid, markdown, Nunjucks, etc.) inside of WebC.
* Works great with out of the box with [is-land](https://www.11ty.dev/docs/plugins/partial-hydration/)

## ➡ [Documentation](https://www.11ty.dev/docs/languages/webc/)

- Please star [Eleventy on GitHub](https://github.com/11ty/eleventy/)!
- Follow us on Twitter [@eleven_ty](https://twitter.com/eleven_ty)
- Support [11ty on Open Collective](https://opencollective.com/11ty)
- Subscribe to our [YouTube channel](https://11ty.dev/youtube)
- [11ty on npm](https://www.npmjs.com/org/11ty)
- [11ty on GitHub](https://github.com/11ty)

[![npm Version](https://img.shields.io/npm/v/@11ty/eleventy-plugin-webc.svg?style=for-the-badge)](https://www.npmjs.com/package/@11ty/eleventy-plugin-webc)

## Installation

It’s on [npm at `@11ty/eleventy-plugin-webc`](https://www.npmjs.com/package/@11ty/eleventy-plugin-webc)!

```
npm install @11ty/eleventy-plugin-webc
```

To add support for `.webc` files in Eleventy, add the plugin in your Eleventy configuration file:

```js
const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebc);
};
```

<details>
<summary><strong>Full options list</strong></summary>

```js
const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebc, {
		// Glob to find no-import global components
		components: false,
		// components: "_includes/components/**/*.webc",

		// Adds an Eleventy WebC transform to process all HTML output
		useTransform: false,

		// Additional global data used in the Eleventy WebC transform
		transformData: {},
	});
};
```

</details>

### How to use it

There are a few different ways to use WebC in Eleventy:

1. Add a new `.webc` file to your Eleventy input directory
1. Use the [Render plugin](https://www.11ty.dev/docs/plugins/render/) in an existing template
1. Preprocess all HTML input as WebC
1. Use the WebC Eleventy transform to process all of the HTML output (disabled by default)

#### Add New `.webc` files

Adding the plugin will enable support for `.webc` files in your Eleventy project. Just make a new `.webc` HTML file in your Eleventy input directory and Eleventy will process it for you! If you’re using [global components](#components), don’t forget to point the plugin to your components directory!

Notably, `.webc` files will operate [WebC in bundler mode](https://github.com/11ty/webc#aggregating-css-and-js), [aggregating the CSS and JS](#css-and-js) in use on each individual page to create a bundle of the assets in use on the page.

```js
const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebc, {
		// Glob to find no-import global components
		components: "_includes/components/**/*.webc",
	});
};
```

#### Use the Render plugin

Using Eleventy’s built-in [Render plugin](https://www.11ty.dev/docs/plugins/render/) with WebC also works great.

Consider this example Nunjucks or Liquid template:

```
{% renderTemplate "webc" %}
<my-custom-component></my-custom-component>
{% endrenderTemplate %}
```

#### Preprocess all HTML input as WebC

You can use the configuration option to change the default HTML preprocessor (from `liquid`) to `webc`. This might look like `htmlTemplateEngine: "webc"`. Read more on the [Eleventy documentation: Default Template Engine for HTML Files](https://www.11ty.dev/docs/config/#default-template-engine-for-html-files).

#### Use the global WebC Eleventy transform

This is a catch-all option to let WebC process _all_ `.html` output files in your project. [Read more about Eleventy transforms.](https://www.11ty.dev/docs/config/#transforms) This method is useful when you want to get up and running with WebC on an existing project quickly (but is also the slowest method for build-performance).

The WebC Eleventy transform operates WebC in non-bundler mode, which means that it does process WebC but _does not_ aggregate JS or CSS on the page.

The transform is disabled by default, you will need to add a configuration option to enable it:

```js
const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebc, {
		useTransform: true,
	});
};
```

## Examples

Add a new `.webc` file to your Eleventy input directory and it will render as WebC to your output directory (`_site` by default).

`my-page.webc`:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>WebC Example</title>
	</head>
	<body>
		WebC *is* HTML.
	</body>
</html>
```

### Use Front Matter

WebC in Eleventy works automatically with standard Eleventy conventions for [front matter](https://www.11ty.dev/docs/data-frontmatter/) (though front matter in Eleventy is _optional_).

Notably you can use `yaml`, `json`, `js`, or [add your own data format](https://www.11ty.dev/docs/data-frontmatter-customize/) for front matter in Eleventy.

`with-front-matter.webc` (using `_includes/my-layout.webc` as an [Eleventy layout](https://www.11ty.dev/docs/layouts/)):

```html
---
layout: "my-layout.webc"
---
<my-webc-component>WebC *is* HTML.</my-webc-component>
```

`_includes/my-layout.webc`:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<title></title>
	</head>
	<body @html="this.content"></body>
</html>
```

### Components

There are a few ways to use web components here:

1. You can use `webc:import` inside of your components to import another component directly.
2. Use global no-import components specified in your config file.
3. Specify a glob of no-import components at a directory or template level in the data cascade.

Notably, WebC components are not restricted to the same naming limitations as custom elements (they do not require a dash in the name). The [WebC documentation has all of the detail on how to use and configure WebC components](https://github.com/11ty/webc#html-imports-kidding-kinda).

#### Global no-import Components

Use the `components` property in the Full options list in your Eleventy configuration file to specify project-wide WebC component files available for use in any page.

```js
const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebc, {
		// Glob to find no-import global components
		components: "_includes/components/**/*.webc",
	});
};
```

#### Specify no-import Components in the Data Cascade

You can also use and configure specific components as part of the data cascade as well (scoped to a folder or a template) by assigning a glob (or array of globs) to `webc.components`, like so:

`my-directory/my-page.webc`:

```html
---
layout: "my-layout.webc"
webc:
	components: "./webc/*.webc"
---
<my-webc-component>WebC *is* HTML.</my-webc-component>
```

* Usage warning: By default these paths are relative to the template file. If you’re setting this in the data cascade to apply multiple child folders deep, it might be better to use the global no-import components option above OR to use `~/` as a prefix (e.g. `~/my-directory/webc/*.webc`) to alias to the project’s root directory.

### CSS and JS (Bundler mode)

[Eleventy Layouts](https://www.11ty.dev/docs/layouts/) can bundle any specific page’s assets (CSS and JS used by components on the page). These are automatically rolled up when a component uses `<script>` or `<style>`. You can use this to easily implement component-driven Critical CSS.

`_includes/webc/my-webc-component.webc`:

```html
<style>/* This is component CSS */</style>
<script>/* This is component JS */</script>
```

`_includes/layout.webc`:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<title></title>
		<style @html="this.getCSS(this.page.url)"></style>
		<script @html="this.getJS(this.page.url)"></script>
	</head>
	<body @html="this.content"></body>
</html>
```

#### Asset bucketing

Components can use the `webc:bucket` feature to output to any arbitrary bucket name for compartmentalization at the component level.

`_includes/webc/my-webc-component.webc`:

```html
<style>/* This CSS is put into the default bucket */</style>
<script>/* This JS is put into the default bucket */</script>
<style webc:bucket="defer">/* This CSS is put into the `defer` bucket */</style>
<script webc:bucket="defer">/* This JS is put into the `defer` bucket */</script>
```

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<title></title>
		<!-- Default bucket -->
		<style @html="this.getCSS(this.page.url)"></style>
		<script @html="this.getJS(this.page.url)"></script>
	</head>
	<body>
		<template webc:nokeep @html="this.content"></template>

		<!-- `defer` bucket -->
		<style @html="this.getCSS(this.page.url, 'defer')"></style>
		<script @html="this.getJS(this.page.url, 'defer')"></script>
	</body>
</html>
```

### Use any Eleventy Template Syntax

We’ve wired up [WebC’s Custom Transforms feature](https://github.com/11ty/webc#custom-transforms) `webc:type="11ty"` to the [Eleventy Render plugin](https://www.11ty.dev/docs/plugins/render/) to allow you to use existing Eleventy template syntax inside of WebC.

Use the `11ty:type` attribute to specify a [valid template syntax](https://www.11ty.dev/docs/plugins/render/#rendertemplate).

`my-page.webc`:

```
---
frontmatterdata: "Hello from Front Matter"
---
<template webc:type="11ty" 11ty:type="liquid,md">
{% assign t = "Liquid in WebC" %}
## {{ t }}

_{{ frontmatterdata }}_
</template>
```

You have full access to the data cascade here (see `frontmatterdata` in the example above).

### Use with `is-land`

You can also use this out of the box with Eleventy’s [`is-land` component for web component hydration](https://www.11ty.dev/docs/plugins/partial-hydration/).

At the component level, components can declare their own is-land loading conditions.

`_includes/webc/my-webc-component.webc`:

```html
<is-land on:visible>
	<template data-island>
		<!-- CSS -->
		<style webc:keep>
		/* This is on-visible CSS */
		</style>
		<link rel="stylesheet" href="some-arbitrary-css.css" webc:keep>

		<!-- JS -->
		<script type="module" webc:keep>
		console.log("This is on-visible JavaScript");
		</script>
		<script type="module" src="some-arbitrary-js.js" webc:keep></script>
	</template>
</is-land>
```
