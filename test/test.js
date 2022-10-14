const test = require("ava");
const Eleventy = require("@11ty/eleventy");
const pkg = require("../package.json");

function normalizeNewLines(str) {
  return str.replace(/\r\n/g, "\n");
}

test("Sample page (webc layout)", async t => {
	let elev = new Eleventy("./test/sample-1/page.webc", "./test/sample-1/_site", {
		configPath: "./test/sample-1/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(result.content.trim(), `<!doctype html>
<html lang="en">
<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content>
		<title></title>
		<style></style>
		<script></script>
	</head>
	<body>
		<say-hello></say-hello>
<say-hello></say-hello>
WHO IS THIS
hi
<span>HELLO FROM FRONT MATTER</span>

		<style></style>
		<script></script>
	
</body>
</html>`);
});

test("Sample page (liquid layout and one webc component)", async t => {
	let elev = new Eleventy("./test/sample-non-webc-layout/page.webc", "./test/sample-non-webc-layout/_site", {
		configPath: "./test/sample-non-webc-layout/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(normalizeNewLines(result.content.trim()), `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<title></title>
		<style>* { color: red; }</style>
		<script></script>
	</head>
	<body>
		<say-hello>HELLO
</say-hello>
<say-hello>HELLO
</say-hello>
WHO IS THIS
hi
<span>HELLO FROM FRONT MATTER</span>

		<style></style>
		<script></script>
	</body>
</html>`);
});

test("Sample page with global component", async t => {
	let elev = new Eleventy("./test/sample-2/page.webc", "./test/sample-2/_site", {
		configPath: "./test/sample-2/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(result.content.trim(), `<!doctype html>
<html lang="en">
<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content>
		<title></title>
		<style></style>
		<script></script>
	</head>
	<body>
		This is a component.
This is a component.
WHO IS THIS
hi
<span>HELLO FROM FRONT MATTER</span>

		<style></style>
		<script></script>
	
</body>
</html>`);
});

test("Page with front matter no-import components", async t => {
	let elev = new Eleventy("./test/sample-page-global-components/page.webc", "./test/sample-page-global-components/_site", {
		configPath: "./test/sample-page-global-components/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(result.content.trim(), `<!doctype html>
<html lang="en">
<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content>
		<title></title>
		<style></style>
		<script></script>
	</head>
	<body>
		HELLO
HELLO
WHO IS THIS
hi
<span>HELLO FROM FRONT MATTER</span>

		<style></style>
		<script></script>
	
</body>
</html>`);
});


test("Page with front matter no-import components (relative to input path)", async t => {
	let elev = new Eleventy("./test/sample-page-global-components-relative-to-inputpath/page.webc", "./test/sample-page-global-components-relative-to-inputpath/_site", {
		configPath: "./test/sample-page-global-components-relative-to-inputpath/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(result.content.trim(), `<!doctype html>
<html lang="en">
<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content>
		<title></title>
		<style></style>
		<script></script>
	</head>
	<body>
		HELLO
HELLO
WHO IS THIS
hi
<span>HELLO FROM FRONT MATTER</span>

		<style></style>
		<script></script>
	
</body>
</html>`);
});

test("WebC using a transform", async t => {
	let elev = new Eleventy("./test/sample-transform/", "./test/sample-transform/_site", {
		configPath: "./test/sample-transform/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(result.content.trim(), `HELLO<span>${pkg.version}</span>
HELLO<span>${pkg.version}</span>
WHO IS THIS
hi
<span>HELLO FROM FRONT MATTER</span>`);
});

test("WebC using htmlTemplateEngine", async t => {
	let elev = new Eleventy("./test/sample-html-preprocess/", "./test/sample-html-preprocess/_site", {
		configPath: "./test/sample-html-preprocess/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(result.content.trim(), `HELLO<span>${pkg.version}</span>
HELLO<span>${pkg.version}</span>
WHO IS THIS
hi`);
});

test("Sample page with permalink: false (issue #9)", async t => {
	let elev = new Eleventy("./test/sample-permalink-false/", "./test/sample-permalink-false/_site", {
		configPath: "./test/sample-permalink-false/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(result.content.trim(), `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<title></title>
	</head>
	<body>

	</body>
</html>`);
});

test("Add JS Functions as helpers (universal filters) (issue #3)", async t => {
	let elev = new Eleventy("./test/sample-universal-helpers/", "./test/sample-universal-helpers/_site", {
		configPath: "./test/sample-universal-helpers/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(result.content.trim(), `<!doctype html>
<html lang="en">
<head>
		<title></title>
	</head>
	<body>helloAlways return this</body>
</html>`);
});
