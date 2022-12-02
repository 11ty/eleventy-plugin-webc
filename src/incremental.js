const { DepGraph } = require("dependency-graph");

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

		let graph = new DepGraph();
		for(let layout in layouts) {
			if(!graph.hasNode(layout)) {
				graph.addNode(layout);
			}
			for(let child of layouts[layout]) {
				if(!layouts[child]) {
					// not a layout
					continue;
				}
				if(!graph.hasNode(child)) {
					graph.addNode(child);
				}
				graph.addDependency(child, layout);
			}
		}

		this.layoutDependencyGraph = graph;
	}

	isOutermostLayoutInChain(layoutFilePath) {
		if(this.layouts && this.layouts[layoutFilePath]) {
			return this.layoutDependencyGraph.dependenciesOf(layoutFilePath).length === 0;
		}
		return false;
	}

	isFileUsingLayout(templateFilePath, layoutFilePath) {
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
