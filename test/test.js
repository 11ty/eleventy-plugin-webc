const test = require("ava");
const Eleventy = require("@11ty/eleventy");
const pkg = require("../package.json");

function normalize(str) {
  return str.trim().replace(/\r\n/g, "\n");
}

test("Sample page (webc layout)", async t => {
	let elev = new Eleventy("./test/sample-1/page.webc", "./test/sample-1/_site", {
		configPath: "./test/sample-1/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(normalize(result.content), `<!doctype html>
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

	t.is(normalize(result.content), `<!doctype html>
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

	t.is(normalize(result.content), `<!doctype html>
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

	t.is(normalize(result.content), `<!doctype html>
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

	t.is(normalize(result.content), `<!doctype html>
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

	t.is(normalize(result.content), `HELLO<span>${pkg.version}</span>
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

	t.is(normalize(result.content), `HELLO<span>${pkg.version}</span>
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

	t.is(normalize(result.content), `<!doctype html>
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

	t.is(normalize(result.content), `<!doctype html>
<html lang="en">
<head>
		<title></title>
	</head>
	<body>helloAlways return this</body>
</html>`);
});

test("Use render plugin #22", async t => {
	let elev = new Eleventy("./test/render-plugin/page.md", "./test/render-plugin/_site", {
		configPath: "./test/render-plugin/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(normalize(result.content), `<h1>Hello</h1>
<p>My component</p>`);
});

test("UID leftovers #17", async t => {
	let elev = new Eleventy("./test/uid-leftovers/page.webc", "./test/uid-leftovers/_site", {
		configPath: "./test/uid-leftovers/eleventy.config.js"
	});

	await elev.toJSON();

	let results = await elev.toJSON();
	let [result] = results;

	t.is(normalize(result.content), `<!doctype html>
<html>
<head>
		<title></title>
		<style>#webc-2 {}</style>
	</head>
	<body>
</body>
</html>`);
});

test("Custom permalink JS, issue #27", async t => {
	let elev = new Eleventy("./test/custom-permalink/page.webc", "./test/custom-permalink/_site", {
		configPath: "./test/custom-permalink/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;

	t.is(result.url, "hello-from-front-matter.html")
	t.is(normalize(result.content), `<say-hello></say-hello>
<say-hello></say-hello>
WHO IS THIS
hi
<span>HELLO FROM FRONT MATTER</span>`);
});

test("Raw layout html to re-enable reprocessing mode in layouts, issue #20", async t => {
	let elev = new Eleventy("./test/raw-layout-html/page.webc", "./test/raw-layout-html/_site", {
		configPath: "./test/raw-layout-html/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;
	t.is(normalize(result.content), `<!doctype html>
<html lang="en">
<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content>
		<title></title>
		<style>/* <reprocess-me>Hello</reprocess-me> */</style>
	</head>
	<body>
		<say-hello><reprocess-me>Using raw here to test reprocessing in the layout</reprocess-me>
</say-hello>
<say-hello><reprocess-me>Using raw here to test reprocessing in the layout</reprocess-me>
</say-hello>
WHO IS THIS
hi
<span>HELLO FROM FRONT MATTER</span>
		REPROCESSED
	
</body>
</html>`);
});


test("Shortcodes, issue #16", async t => {
	let elev = new Eleventy("./test/shortcodes-issue-16/page.webc", "./test/shortcodes-issue-16/_site", {
		configPath: "./test/shortcodes-issue-16/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;
	t.is(normalize(result.content), `HELLO FROM FRONT MATTER
<undefined-component></undefined-component>COMPONENTS DIR
LOWERCASE`);
});

test("Nested layouts", async t => {
	let elev = new Eleventy("./test/nested-layouts/page.webc", "./test/nested-layouts/_site", {
		configPath: "./test/nested-layouts/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;
	t.is(normalize(result.content), `<!doctype html>
<html lang="en">
<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content>
		<title></title>
		<style>/* <reprocess-me>Hello</reprocess-me> */</style>
	</head>
	<body>
		Base
Testing

<style>/* <reprocess-me>Hello</reprocess-me> */</style>
	
</body>
</html>`);
});

test("Components in layouts #11", async t => {
	let elev = new Eleventy("./test/components-in-layouts/", "./test/components-in-layouts/_site", {
		configPath: "./test/components-in-layouts/eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [page1] = results.filter(page => page.inputPath.endsWith("page1.webc"));
	let [page2] = results.filter(page => page.inputPath.endsWith("page2.webc"));
	let [page3] = results.filter(page => page.inputPath.endsWith("page3.webc"));

	t.is(normalize(page1.content), `<!doctype html>
<html lang="en">
<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content>
		<title></title>
		<style>/* Inner CSS */
/* Outer CSS */</style>
	</head>
	<body>
		Page
<inner>Test
</inner>
		<outer>Test
</outer>
	
</body>
</html>`);

t.is(normalize(page2.content), `<!doctype html>
<html lang="en">
<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content>
		<title></title>
		<style>/* Inner CSS */
/* Outer CSS */</style>
	</head>
	<body>
		Other page
<inner>Test
</inner>
		<outer>Test
</outer>
	
</body>
</html>`);

t.is(normalize(page3.content), `No layouts here
<style>/* Outer CSS */</style>
<outer>Test
</outer>`);
});
