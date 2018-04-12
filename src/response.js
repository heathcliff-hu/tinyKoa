const statuses = require('statuses');
const getType = require('mime-types').contentType;

module.exports = {

    /**
     * Return response header.
     *
     * @return {Object}
     * @api public
     */
    get header() {
        const {res} = this;
        return typeof res.getHeaders === 'function'
            ? res.getHeaders()
            : res._headers || {};  // Node < 7.7
    },

    /**
     * Return response header, alias as response.header
     *
     * @return {Object}
     * @api public
     */
    get headers() {
        return this.header;
    },

    /**
     * Return response body
     *
     * @return {data|String|Buffer|Object|Stream}
     * @api public
     */
    get body() {
        return this._body;
    },

    /**
     * Set response body.
     *
     * @param {String|Buffer|Object|Stream} data
     * @api public
     */
    set body(data) {
        // no content
        if (null == data) {
            if (!statuses.empty[this.status]) this.status = 204;
            this.remove('Content-Type');
            this.remove('Content-Length');
            this.remove('Transfer-Encoding');

            return;
        }
        if (!this._explicitStatus) this.status = 200;
        this._body = data;
    },

    get status() {
        return this.res.statusCode;
    },

    /**
     * Check if a header has been written to the socket.
     *
     * @return {Boolean}
     * @api public
     */
    get headerSent() {
        return this.res.headersSent;
    },

    /**
     * Set response status code
     *
     * @param {number} statusCode
     * @api public
     */
    set status(statusCode) {
        this._explicitStatus = true;
        if (typeof statusCode !== 'number') {
            throw new Error('statusCode must be a number!');
        }
        this.res.statusCode = statusCode;
    },

    /**
     * Set Content-Type response header with `type` through `mime.lookup()`
     * when it does not contain a charset.
     *
     * Examples:
     *
     *     this.type = '.html';
     *     this.type = 'html';
     *     this.type = 'json';
     *     this.type = 'application/json';
     *     this.type = 'png';
     *
     * @param {String} type
     * @api public
     */

    set type(type) {
        type = getType(type);
        if (type) {
            this.set('Content-Type', type);
        } else {
            this.remove('Content-Type');
        }
    },

    /**
     * Return response header.
     *
     * Examples:
     *
     *     this.get('Content-Type');
     *     // => "text/plain"
     *
     *     this.get('content-type');
     *     // => "text/plain"
     *
     * @param {String} field
     * @return {String}
     * @api public
     */

    get(field) {
        return this.header[field.toLowerCase()] || '';
    },

    /**
     * Set header `field` to `val`, or pass
     * an object of header fields.
     *
     * Examples:
     *
     *    this.set('Foo', ['bar', 'baz']);
     *    this.set('Accept', 'application/json');
     *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
     *
     * @param {String|Object|Array} field
     * @param {String} val
     * @api public
     */

    set(field, val) {
        if (this.headerSent) return;

        if (2 === arguments.length) {
            if (Array.isArray(val)) val = val.map(String);
            else val = String(val);
            this.res.setHeader(field, val);
        } else {
            for (const key in field) {
                this.set(key, field[key]);
            }
        }
    },
};