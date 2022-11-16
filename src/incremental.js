class WebCIncremental {
	constructor() {
		this.pages = {};
		this.setups = {};
	}

	setWebC(cls) {
		this.webc = cls;
	}

	setLayouts(layouts) {
		this.layouts = layouts;
	}

	isTemplateUsingLayout(templateFilePath, layoutFilePath) {
		if(this.layouts && this.layouts[layoutFilePath] && this.layouts[layoutFilePath].includes(templateFilePath)) {
			return true;
		}
		return false;
	}

	add(inputContent, inputPath) {
		let WebC = this.webc;
		let page = new WebC();

		// Explicitly disable bundler mode for layouts
		if(this.layouts && this.layouts[inputPath]) {
			page.setBundlerMode(false);
		} else {
			page.setBundlerMode(true);
		}

		page.setContent(inputContent, inputPath);

		this.pages[inputPath] = page;

		return page;
	}

	addSetup(inputPath, setup) {
		this.setups[inputPath] = setup;
	}

	get(inputPath) {
		let setup = this.setups[inputPath];
		let components = setup.serializer.components;

		if(setup && components) {
			setup.serializer.restorePreparsedComponents(components);
		}

		return {
			page: this.pages[inputPath],
			setup,
			components,
		}
	}
}

module.exports = WebCIncremental;
