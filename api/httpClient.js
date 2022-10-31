const http = require('http');
const https = require('https');

const DEFAULT_GET_OPTIONS = {
    port: 443,
    method: "GET",
    headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "UserAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
    },
};

module.exports = {
    /**
     * getText:  RESTful GET request returning text
     * @param options: http options object
     */
    getText: (options) => {
        console.log('rest::getJSON');
        const getOptions = { ...DEFAULT_GET_OPTIONS, ...options };
        const port = getOptions.port == 443 ? https : http;

        const result = new Promise((resolve, reject) => {
            let output = '';

            const req = port.request(getOptions, (res) => {
                console.log(`${getOptions.host} : ${res.statusCode}`);
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
