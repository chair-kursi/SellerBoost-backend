const URL = require("url").URL;


const getStyleEntity = (req) => {
	let entity = {};

	if (req.body.styleCode)
		entity = { ...entity, styleCode: req.body.styleCode }
	else if (req.params.styleCode)
		entity = { ...entity, styleCode: req.params.styleCode }//ASK: What if the styleCode is neither in req.params.styleCode nor in req.body.styleCode??



	entity = {
		...entity,
		name: req.body.name,
		frontImageUrl: req.body.frontImageUrl,
		backImageUrl: req.body.backImageUrl,
		zoomImageUrl: req.body.zoomImageUrl
	}

	return entity;
}


validateStyle = function (req) {

	const styleEntity = getStyleEntity(req);

	const validateStyleCode = (code) => {
		if (!code)
			return "Invalid StyleCode, StyleCode cannot be EMPTY.";

		if (code.length > 20 || code.length < 3)
			return "Invalid StyleCode, try again!!";
		for (let i = 0; i < code.length; i++) {
			var c = code.charCodeAt(i);
			if (!(c > 47 && c < 58) &&
				!(c > 64 && c < 91) &&
				code[i] !== '-' &&
				code[i] !== ' ' &&
				code[i] !== ':') {
				return "Invalid StyleCode, try again!!";
			}
		}
		return "";
	}

	const validateName = (name) => {
		if (!name)
			return "Invalid Name, it cannot be EMPTY.";

		if (name.length > 100 || name.length < 5)
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

	const validateUrl = (url) => {
		if (!url)
			return "";//this is empty as the imgUrls are optional

		try {
			new URL(url);
			return "";
		} catch (err) {
			return "Invalid URL!! HINT: try again with http:// OR https://";
		}
	};

	var locator = [];
	const styleCodeErr = validateStyleCode(styleEntity.styleCode)
	const nameErr = validateName(styleEntity.name);
	const frontImageUrlErr = validateUrl(styleEntity.frontImageUrl)
	const backImageUrlErr = validateUrl(styleEntity.backImageUrl)
	const zoomImageUrlErr = validateUrl(styleEntity.zoomImageUrl) 
	//not validating hasSize as it is by default handeled by schema



	if (req.body.styleCode && styleCodeErr.length)
		locator = [...locator, {
			id: "styleCode",
			message: styleCodeErr
		}];
	if (req.body.name && nameErr.length)
		locator = [...locator, {
			id: "name",
			message: nameErr
		}];
	if (req.body.frontImageUrl && frontImageUrlErr)
		locator = [...locator, {
			id: "frontImageUrl",
			message: frontImageUrlErr
		}];
	if (req.body.backImageUrl && backImageUrlErr)
		locator = [...locator, {
			id: "backImageUrl",
			message: backImageUrlErr
		}];
	if (req.body.zoomImageUrl && zoomImageUrlErr)
		locator = [...locator, {
			id: "zoomImageUrl",
			message: zoomImageUrlErr
		}];
	// if (req.body.hasSize && hasSizeErr.length)
	// 	locator = [...locator, {
	// 		id: "hasSize",
	// 		message: hasSizeErr
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
				internalMessage: "Handler dispatch failed; nested exception is java.lang.Error: Unresolved compilation problem: \n\tSyntax error, insert \";\" to complete ReturnStatement\n",
				timeStamp: timeStamp
			}
		}
	}

	return response;

}


//Mock Coding STARTS
successStyleResponse = function (res) {
	let response = {
		data: {
			styleCode: "SB-11",
			name: "Kurti",
			type: "Single",
			hasSize: "false",
			color: "Blue",
			frontImageUrl: "https://m.media-amazon.com/images/I/71h+V+wDLtL._AC_UX385_.jpg",
			backImageUrl: "https://m.media-amazon.com/images/I/71h+V+wDLtL._AC_UX385_.jpg",
			zoomImageUrl: "https://m.media-amazon.com/images/I/71h+V+wDLtL._AC_UX385_.jpg",
		},
		error: {}
	}
	return res.status(200).json(response)
}

errorStyleResponse = function (res) {
	let response = {
		data: {},
		error: {
			errorCode: "GenEx",
			httpStatus: 400,
			locator: [{
				id: "StyleCode",
				message: "Specials is not allowed in styleCode"
			},
			{
				id: "name",
				message: "? is not allowed in name"
			}],
			internalMessage: "Handler dispatch failed; nested exception is java.lang.Error: Unresolved compilation problem: \n\tSyntax error, insert \";\" to complete ReturnStatement\n",
			timestamp: "2021-09-07T15:08:54.532529"
		}
	}
	return res.status(400).json(response)
}
//MOCK CODING ENDS


module.exports = {
	validateStyle,
	successStyleResponse,                        //MOCK FUNCTONS
	errorStyleResponse,                          //MOCK FUNCTONS 
}