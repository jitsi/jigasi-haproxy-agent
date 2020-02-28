const http = require('http');

/**
 * RestClient accesses rest endpoints on jigasi
 */
class RestClient {
    /**
     * constructor
    * @param {object} options
    */
    constructor(options) {
        this._options = {
            host: 'localhost',
            port: 8788,
            ...options };
    }

    /**
     * get health value
     */
    async getHealth() {
        return await this._get(`http://${this._options.host}:${this._options.port}/about/health`);
    }

    /**
     * get stats value
     */
    async getStats() {
        return await this._get(`http://${this._options.host}:${this._options.port}/about/stats`);
    }

    /**
     * GET helper
     * @param {string} url
     */
    async _get(url) {
        return new Promise((resolve, reject) => {
            const options = { timeout: 1000 };

            http.get(url, options, res => {
                const { statusCode } = res;
                const contentType = res.headers['content-type'];

                let error;

                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n'
                                    + `Status Code: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('Invalid content-type.\n'
                                    + `Expected application/json but received ${contentType}`);
                }
                if (error) {
                    console.error(error.message);

                    // Consume response data to free up memory
                    res.resume();
                    reject(error);

                    return;
                }

                res.setEncoding('utf8');
                let rawData = '';

                res.on('data', chunk => {
                    rawData += chunk;
                });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);

                        //                    console.log(parsedData);

                        resolve(parsedData);
                    } catch (e) {
                        console.error(e.message);
                        reject(e);
                    }
                });
            }).on('error', e => {
                console.error(`Got error: ${e.message}`);
                reject(e);
            });
        });
    }

}

module.exports = RestClient;
