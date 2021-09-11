validateSku = function (req) {

    const validateSkuCode = (code) => {
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


    var locator = [];
    const skuCodeErr = validateSkuCode(req.body.skuCode)

    if (req.body.skuCode && skuCodeErr.length)
        locator = [...locator, {
            id: "skuCode",
            message: skuCodeErr
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
    validateSku
}