const { readFile } = require('fs/promises');

function fetchAvailableEndpoints() {
    
    return readFile('./endpoints.json', 'utf8').then((endpoints) => {
        return JSON.parse(endpoints)
    })
    
}

module.exports = { fetchAvailableEndpoints }