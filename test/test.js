const test = require("ava");
const Eleventy = require("@11ty/eleventy");

test("Sample page", async t => {
	let elev = new Eleventy("./test/sample-1/", "./test/sample-1/_site", {
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

test("Sample page with global component", async t => {
	let elev = new Eleventy("./test/sample-2/", "./test/sample-2/_site", {
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