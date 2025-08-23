// Code cribbed from WebC’s attributeSerializer.js
async function evaluateInlineCode(codeString, options = {}) {
	let { filePath, context, data } = Object.assign({ data: {} }, options);

	let { parseCode, walkCode, importFromString } = await import("import-module-string");
	let varsInUse = [];
	try {
		let {used} = walkCode(parseCode(codeString));
		varsInUse = used;
	} catch(e) {
		let errorString = `Error parsing inline code: \`${codeString}\``;

		// Issue #45: very defensive error message here. We only throw this error when an error is thrown during compilation.
		if(e.message.startsWith("Unexpected token ") && codeString.match(/\bclass\b/) && !codeString.match(/\bclass\b\s*\{/)) {
			throw new Error(`${errorString ? `${errorString} ` : ""}\`class\` is a reserved word in JavaScript. Change \`class\` to \`this.class\` instead!`);
		}

		throw new Error(`${errorString}\nOriginal error message: ${e.message}`);
	}

	let argString = "";
	if(!Array.isArray(varsInUse)) {
		varsInUse = Array.from(varsInUse)
	}
	if(varsInUse.length > 0) {
		argString = `{ ${varsInUse.join(", ")} }`;
	}

	let code = `export default function(${argString}) { return ${codeString} };`;

	let evaluated = await importFromString(code, {
		filePath,
		implicitExports: false,
	}).then(mod => {
		let fn = mod.default;
		if(context) {
			return fn.call(context, data);
		}
		return fn(data);
	}).catch(e => {
		throw new Error(`Error evaluating inline code: \`${codeString}\``, { cause: e });
	});

	return evaluated;
}

module.exports =  {
	evaluateInlineCode
};
