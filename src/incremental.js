class WebCIncremental {
	constructor() {
		this.pages = {};
		this.setups = {};
		this.globalComponentsMap = false;
		this.components = {};
	}

	setWebC(cls) {
		this.webc = cls;
	}

	needsComponents() {
		return this.globalComponentsMap === false;
	}

	setComponents(glob) {
		let map = this.getComponentMap(glob);
		if(map) {
			this.globalComponentsMap = map;
		}
	}
	
	getComponentMap(glob) {
		if(!this.webc) {
			return false;
		}
		
		let WebC = this.webc;
		let components = WebC.getComponentsMap(glob);
		// console.log( glob, Object.keys(components).length );
		return components;
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
		page.setBundlerMode(true);
		page.setContent(inputContent, inputPath);

		if(this.globalComponentsMap) {
			page.defineComponents(this.globalComponentsMap);
		}

		this.pages[inputPath] = page;

		return page;
	}

	addSetup(inputPath, setup) {
		this.setups[inputPath] = setup;
		this.components[inputPath] = setup.serializer.components;
	}

	get(inputPath) {
		let setup = this.setups[inputPath];
		let components = this.components[inputPath];

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