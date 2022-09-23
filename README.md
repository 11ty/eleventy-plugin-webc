<p align="center"><img src="https://www.11ty.dev/img/logo-github.svg" width="200" height="200" alt="11ty Logo"></p>

# eleventy-plugin-webc 🕚⚡️🎈🐀

Adds support for [WebC, the single file web component format](https://github.com/11ty/webc), to Eleventy.

## Features

* All of the [framework-independent WebC features](https://github.com/11ty/webc#features) out of the box.
* First-class incremental support (for page templates, components, and Eleventy layouts) (use with `--incremental`)
* Tired of `import` everywhere? Configure no-import global web components or configured in the data cascade to apply to a single template, a directory of templates, or a complex hierarchy of folders-o-templates.
* WebC components can feed into multiple asset pipelines for use on your page. We call this asset bucketing.


## ➡ [Documentation](https://www.11ty.dev/docs/languages/webc/)

- Please star [Eleventy on GitHub](https://github.com/11ty/eleventy/)!
- Follow us on Twitter [@eleven_ty](https://twitter.com/eleven_ty)
- Support [11ty on Open Collective](https://opencollective.com/11ty)
- Subscribe to our [YouTube channel](https://11ty.dev/youtube)
- [11ty on npm](https://www.npmjs.com/org/11ty)
- [11ty on GitHub](https://github.com/11ty)

[![npm Version](https://img.shields.io/npm/v/@11ty/eleventy-dev-server.svg?style=for-the-badge)](https://www.npmjs.com/package/@11ty/eleventy-dev-server)

## Installation

```
npm install @11ty/eleventy-plugin-webc
```

## Usage

Enable the plugin in your Eleventy configuration file:

```js
const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebc);
};
```

### Full options list

```js
const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebc, {
		// Glob to find no-import global components
		components: "_includes/components/**/*.webc", // defaults to `false`
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

### Global no-import Components

Use the `components` property in the Full options list in your Eleventy configuration file to specify project-wide WebC component files available for use in any page.

### Specify no-import Components in the Data Cascade

You can also use and configure specific components as part of the data cascade as well (global to a folder or a specific template) by assigning a glob (or array of globs) to `webc.components`, like so:

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

### CSS and JS

[Eleventy Layouts](https://www.11ty.dev/docs/layouts/) can bundle any specific page’s assets (CSS and JS used by components on the page). These are automatically rolled up when a component uses `<script>` or `<style>`. You can use this to easily implement component-driven Critical CSS.

`my-webc-component.webc`:

```html
<style>/* This is component CSS */</style>
<script>/* This is component JS */</script>
```

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

`my-webc-component.webc`:

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