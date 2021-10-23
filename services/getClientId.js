const Client = require('../models/Client');

getClientId = () => {  
    return global.clientId.clientId;
}

module.exports = { getClientId }