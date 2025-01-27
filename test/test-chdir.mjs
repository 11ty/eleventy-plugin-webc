import test from "ava";
import Eleventy from "@11ty/eleventy";

function normalize(str) {
  return str.trim().replace(/\r\n/g, "\n");
}

// This needs a CHDIR because the default `components` glob is relative to the root directory (not the input directory)
console.log("Make sure you are running `npm run test` and not `npx ava`");
process.chdir("./test/default-components/");

test("New default components directory, issue #14", async t => {
	let elev = new Eleventy("page.webc", "_site", {
		configPath: "eleventy.config.js"
	});

	let results = await elev.toJSON();
	let [result] = results;
	t.is(normalize(result.content), `COMPONENTS DIR
COMPONENTS DIR
WHO IS THIS
hi
<span>HELLO FROM FRONT MATTER</span>`);
});
