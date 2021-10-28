validateSku = function (skuObj) {

    const validateSkuCode = (code) => {
        if (!code)
            return "Invalid StyleCode, StyleCode cannot be EMPTY.";

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

    var locator = [];
    const skuCodeErr = validateSkuCode(skuObj.skuCode);
    const styleCodeErr = validateStyleCode(skuObj.styleCode);
    const sizeCodeErr = validateSizeCode(skuObj.sizeCode);
    if (skuObj.skuCode && skuCodeErr.length)
        locator = [...locator, {
            id: "skuCode",
            message: skuCodeErr
        }];

    if (skuObj.styleCode && styleCodeErr.length)
        locator = [...locator, {
            id: "styleCode",
            message: styleCodeErr
        }];

    if (skuObj.sizeCode && sizeCodeErr.length)
        locator = [...locator, {
            id: "sizeCode",
            message: sizeCodeErr
        }];

    let response = {};
    if (locator.length) {
        var timeStamp = new Date().toString();
        var errorCode = "";
        for (var i = 0; i < locator.length; i++)
            errorCode += locator[i].message+", ";

        response = {
            data: {},
            error: {
                errorCode: errorCode,
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
    validateSku
}