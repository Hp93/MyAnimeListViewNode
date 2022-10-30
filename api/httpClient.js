const http = require('http');
const https = require('https');

/**
 * getJSON:  RESTful GET request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */

module.exports = {
    getText: (options) => {
        console.log('rest::getJSON');
        const port = options.port == 443 ? https : http;

        const result = new Promise((resolve, reject) => {
            let output = '';

            const req = port.request(options, (res) => {
                console.log(`${options.host} : ${res.statusCode}`);
                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    output += chunk;
                });

                res.on('end', () => {
                    resolve({ statusCode: res.statusCode, content: output });
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.end();
        });

        return result;
    },
};
