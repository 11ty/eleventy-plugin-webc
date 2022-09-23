class Manager {
	constructor() {
		this.reset();
	}

	reset() {
		this.pages = {};
	}

	addToPage(pageUrl, code = [], bucket = "default") {
		if(code.length === 0) {
			return;
		}

		if(!this.pages[pageUrl]) {
			this.pages[pageUrl] = {};
		}
		if(!this.pages[pageUrl][bucket]) {
			this.pages[pageUrl][bucket] = new Set();
		}

		this.pages[pageUrl][bucket].add(code.join("\n"));
	}

	getForPage(pageUrl, bucket = "default") {
		if(this.pages[pageUrl]) {
			return Array.from(this.pages[pageUrl][bucket] || []).join("\n");
		}
		return "";
	}
}

module.exports = Manager;
