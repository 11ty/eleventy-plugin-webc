class BundleAssetsToContent {
	static SPLIT_REGEX = /(<!--WebC:[^:]*:[^:]*:WebC-->)/;
	static SEPARATOR = ":";

	constructor(content) {
		this.content = content;
		this.managers = {};
	}

	static getAssetKey(name, bucket) {
		return `<!--WebC:${name}:${bucket || "default"}:WebC-->`
	}

	setAssetManager(name, assetManager) {
		this.managers[name] = assetManager;
	}

	normalizeMatch(match) {
		if(match.startsWith("<!--WebC:")) {
			let [prefix, name, bucket, suffix] = match.split(BundleAssetsToContent.SEPARATOR);
			return { name, bucket };
		}
		return match;
	}

	findAll() {
		let matches = this.content.split(BundleAssetsToContent.SPLIT_REGEX);
		let ret = [];
		for(let match of matches) {
			ret.push(this.normalizeMatch(match));
		}
		return ret;
	}

	replaceAll(url) {
		let matches = this.findAll();
		return matches.map(match => {
			if(typeof match === "string") {
				return match;
			}
			let {name, bucket} = match;
			if(!this.managers[name]) {
				throw new Error(`No asset manager found for ${name}. Known keys: ${Object.keys(this.managers)}`);
			}
			return this.managers[name].getForPage(url, bucket);
		}).join("");
	}
}

module.exports = BundleAssetsToContent;
