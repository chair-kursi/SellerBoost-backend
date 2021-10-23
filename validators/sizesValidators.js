const getSizeEntity = (req) => {
	let entity = {};

	if (req.body.sizeCode)
		entity = { ...entity, sizeCode: req.body.sizeCode }
	else if (req.params.sizeCode)
		entity = { ...entity, sizeCode: req.params.sizeCode }//ASK: What if the styleCode is neither in req.params.styleCode nor in req.body.styleCode??




	entity = {
		...entity,
		name: req.body.name
	}

	return entity;
}




validateSize = function (sizeObj) {

	// const sizeEntity = getSizeEntity(req);

	const validateSizeCode = (code) => {
		if (!code)
			return "Invalid SizeCode, it can't be EMPTY!!";

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
			return "Invalid Name, it can't be EMPTY!!";

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
	const sizeCodeErr = validateSizeCode(sizeObj.sizeCode);
	// const nameErr = validateName(sizeEntity.name);

	if (sizeCodeErr.length)
		locator = [...locator, {
			id: "sizeCode",
			message: sizeCodeErr
		}];
	// if (nameErr.length)
	// 	locator = [...locator, {
	// 		id: "name",
	// 		message: nameErr
	// 	}];

	let response = {};
	if (locator.length) {
		var timeStamp = new Date().toString();
		response = {
			data: {},
			error: {
				errorCode: "GenEx",
				httpStatus: 400,
				locator: locator,
				internalMessage: "Validation Error",
				timeStamp: timeStamp
			}
		}
	}

	return response;

}



module.exports = {
	validateSize
}