const Client = require('../models/Client');

getClientId = (password) => {
    console.log("global.clientId", global.clientId.clientId);
    // const client = await Client.findOne({ password: global.clientId })
    // console.log(global.clientId);
    return global.clientId.clientId;
}

module.exports = { getClientId }