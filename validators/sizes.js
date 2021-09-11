validateSize = function (req) {

	const validateSizeCode = (code) => {
		if (!code)
			return "";

		if (code.length > 20 || code.length < 3)
			return "Invalid SizeCode, try again!!";
		for (let i = 0; i < code.length; i++) {
			var c = code.charCodeAt(i);
			if (!(c > 47 && c < 58) &&
				!(c > 64 && c < 91) &&
				code[i] !== '-' &&
				code[i] !== ' ' &&
				code[i] !== ':') {
				return "Invalid SizeCode, try again!!";
			}
		}
		return "";
	}

    const validateName = (name) => { 
		if (!name)
			return "";

		if (name.length > 50 || name.length < 3)
			return "Invalid name, try again!!";

		for (let i = 0; i < name.length; i++) {
			var c = name.charCodeAt(i);
			var s = name[i];
			if (!(c > 47 && c < 58) &&
				!(c > 64 && c < 91) &&
				!(c > 96 && c < 123) && // lower alpha (a-z) ) { 
				s !== ' ' && 
				s !== ':' && 
				s !== '-' && 
				s !== '_' && 
				s !== '.' && 
				s !== ']' && 
				s !== '[' && 
				s !== '}' && 
				s !== '{' && 
				s !== ')' && 
				s !== '(') { 
				return "Invalid name, try again!!";
			}
		}

		return "";
	}
 

	var locator = [];
	const sizeCodeErr = validateSizeCode(req.body.sizeCode)
	const nameErr = validateName(req.body.name);  

	if (req.body.sizeCode && sizeCodeErr.length)
		locator = [...locator, {
			id: "sizeCode",
			message: sizeCodeErr
		}];
	if (req.body.name && nameErr.length)
		locator = [...locator, {
			id: "name",
			message: nameErr
		}]; 

	let response = {};
	if (locator.length) {
		var timeStamp = new Date().toString();
		response = {
			data: {},
			error: {
				errorCode: "GenEx",
				httpStatus: 400,
				locator: locator,
				internalMessage: "Handler dispatch failed; nested exception is java.lang.Error: Unresolved compilation problem: \n\tSyntax error, insert \";\" to complete ReturnStatement\n",
				timeStamp: timeStamp
			}
		}
	}

	return response;

}
 
 

module.exports = {
	validateSize
}