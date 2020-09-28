var https = require('https');

// create a url from trello card data
function createURIComponent(cardData) {
    var urlParams = [];
    for (var key of Object.keys(cardData)) {
        var encoded = encodeURIComponent(cardData[key]);
        urlParams.push(`${key}=${encoded}`);
    }
    return urlParams.join('&');
}

// general function for a trello request
function trelloRequest(baseUrl, method, key, token, data) {
    return new Promise((resolve, reject) => {
        var url = baseUrl + '?' + createURIComponent(data) + '&' + createURIComponent({ key: key, token: token });
        const options = {
            hostname: 'api.trello.com',
            path: url,
            method: method,
        }
        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode} (${baseUrl})`)
            var data = '';

            res.on('data', d => {
                data += d;
            })

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(data);
                }
            })
        })
        req.on('error', error => {
            reject(error)
        })
        req.end()

    });
} module.exports = trelloRequest;