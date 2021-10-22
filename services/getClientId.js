const Client = require('../models/Client');

getClientId = async (password) => {
    // const client = await Client.findOne({ password: password })
    return "StyloBug";
}

module.exports = { getClientId }