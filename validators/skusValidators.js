const { isValidSkuCode, isValidStyleCode, isValidSizeCode } = require("./basicValidations");

validateSku = function (skuObj) {

    // const validateSkuCode = (code) => {
    //     if (!code)
    //         return "Invalid SKU code, SKU code cannot be EMPTY.";

    //     if (code.length > 20 || code.length < 3)
    //         return "Invalid SizeCode, try again!!";
    //     for (let i = 0; i < code.length; i++) {
    //         var c = code.charCodeAt(i);
    //         if (!(c > 47 && c < 58) &&
    //             !(c > 64 && c < 91) &&
    //             code[i] !== '-' &&
    //             code[i] !== ' ' &&
    //             code[i] !== ':') {
    //             return "Invalid SKU code, try again!!";
    //         }
    //     }
    //     return "";
    // }

    // const validateStyleCode = (code) => {
    //     if (!code)
    //         return "Invalid Style Code, Style Code cannot be EMPTY.";

    //     if (code.length > 20 || code.length < 3)
    //         return "Invalid StyleCode, try again!!";
    //     for (let i = 0; i < code.length; i++) {
    //         var c = code.charCodeAt(i);
    //         if (!(c > 47 && c < 58) &&
    //             !(c > 64 && c < 91) &&
    //             code[i] !== '-' &&
    //             code[i] !== ' ' &&
    //             code[i] !== ':') {
    //             return "Invalid Style Code, try again!!";
    //         }
    //     }
    //     return "";
    // }

    // const validateSizeCode = (code) => {
    //     if (!code)
    //         return "Invalid Size Code, it can't be EMPTY!!";

    //     if (code.length > 20 || code.length < 3)
    //         return "Invalid Size Code, try again!!";
    //     for (let i = 0; i < code.length; i++) {
    //         var c = code.charCodeAt(i);
    //         if (!(c > 47 && c < 58) &&
    //             !(c > 64 && c < 91) &&
    //             code[i] !== '-' &&
    //             code[i] !== ' ' &&
    //             code[i] !== ':') {
    //             return "Invalid Size Code, try again!!";
    //         }
    //     }
    //     return "";
    // }

    var locator = [];
    const skuCodeErr = isValidSkuCode(skuObj.skuCode);
    const styleCodeErr = isValidStyleCode(skuObj.styleCode);
    const sizeCodeErr = isValidSizeCode(skuObj.sizeCode);
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