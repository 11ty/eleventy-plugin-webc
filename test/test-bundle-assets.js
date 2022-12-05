const test = require("ava");
const BundleAssetsToContent = require("../src/bundleAssets.js");
const CodeManager = require("../src/codeManager.js");

test("getAssetKey", t => {
	t.is(BundleAssetsToContent.getAssetKey("css", "default"), "<!--WebC:css:default:WebC-->");
});

test("findAll Empty", t => {
	let b = new BundleAssetsToContent("BeforeAfter");
	t.deepEqual(b.findAll(), ["BeforeAfter"])
});

test("findAll Single", t => {
	let b = new BundleAssetsToContent(`Before${BundleAssetsToContent.getAssetKey("css", "default")}After`);
	t.deepEqual(b.findAll(), [
		"Before",
		{
			name: "css",
			bucket: "default"
		},
		"After"
	]);
});

test("findAll Double", t => {
	let key1 = BundleAssetsToContent.getAssetKey("css", "default");
	let key2 = BundleAssetsToContent.getAssetKey("js", "default");

	let b = new BundleAssetsToContent(`Before${key1}Middle${key2}After`);
	t.deepEqual(b.findAll(), [
		"Before",
		{
			name: "css",
			bucket: "default"
		},
		"Middle",
		{
			name: "js",
			bucket: "default"
		},
		"After"
	]);
});

test("findAll Triple", t => {
	let key1 = BundleAssetsToContent.getAssetKey("css", "default");
	let key2 = BundleAssetsToContent.getAssetKey("css", "defer");
	let key3 = BundleAssetsToContent.getAssetKey("js", "default");

	let b = new BundleAssetsToContent(`Before${key1}Middle${key2}Yawn${key3}After`);
	t.deepEqual(b.findAll(), [
		"Before",
		{
			name: "css",
			bucket: "default"
		},
		"Middle",
		{
			name: "css",
			bucket: "defer"
		},
		"Yawn",
		{
			name: "js",
			bucket: "default"
		},
		"After"
	]);
});

test("replaceAll", t => {
	let bucket = "default";
	let mgr = new CodeManager();
	mgr.addToPage("/page/", [`p { color: blue; }`], bucket);
	mgr.addToPage("/", [`p { color: red; }`], bucket);

	let b = new BundleAssetsToContent(`<style>${BundleAssetsToContent.getAssetKey("css", bucket)}</style>`);
	b.setAssetManager("css", mgr);

	t.is(b.replaceAll("/page/"), `<style>p { color: blue; }</style>`);
	t.is(b.replaceAll("/"), `<style>p { color: red; }</style>`);
	t.is(b.replaceAll("/non-existent/"), `<style></style>`);
});
