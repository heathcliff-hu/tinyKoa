const EventEmitter = require("events");
const http = require("http");
const Stream = require("stream");

const context = require("./context");
const request = require("./request");
const response = require("./response");

module.exports = class Application extends EventEmitter {
  /**
     * Initialize a new Application.
     * @api public
     */
  constructor() {
    super();
    this.middlewares = [];
    this.context = context;
    this.request = request;
    this.response = response;
  }

  /**
     * Shorthand for:
     *    http.createServer(app.callback()).listen(...)

     * @param args
     * @return {Server}
     * @api public
     */
  listen(...args) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }

  /**
     * @param {Function} middleware
     * @return {Application} self
     * @api public
     */
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  /**
     *
     * 中间件合并方法，将中间件数组合并为一个中间件
     * @return {Function}
     */
  compose() {
    // 将middlewares合并为一个函数，该函数接收一个ctx对象
    return async ctx => {
      function createNext(middleware, oldNext) {
        return async() => {
          await middleware(ctx, oldNext);
        };
      }

      const len = this.middlewares.length;
      let next = async() => Promise.resolve();
      for (let i = len - 1; i >= 0; i--) {
        const currentMiddleware = this.middlewares[i];
        next = createNext(currentMiddleware, next);
      }

      await next();
    };
  }

  /**
     * Return a request handler callback
     * for node's native http server.
     *
     * @return {Function} fn
     * @api public
     */
  callback() {
    return (req, res) => {
      const ctx = this.createContext(req, res);
      const respond = () => this.responseBody(ctx);
      const onerror = err => this.onerror(err, ctx);
      const fn = this.compose();

      return fn(ctx).then(respond).catch(onerror);
    };
  }

  /**
     * Initialize a new context.

     * @param {Object} req
     * @param {Object} res
     * @return {Object} ctx
     * @api private
     */
  createContext(req, res) {
    // Initialize a ctx object for each request
    const ctx = Object.create(this.context);
    ctx.request = Object.create(this.request);
    ctx.response = Object.create(this.response);
    ctx.req = ctx.request.req = req;
    ctx.res = ctx.response.res = res;

    return ctx;
  }

  /**
     * Response helper.
     * @param {Object} ctx
     * @api public
     */
  responseBody(ctx) {
    const content = ctx.body;
    if (typeof content === "string") {
      ctx.res.end(content);
    } else if (typeof content === "object") {
      ctx.res.end(JSON.stringify(content));
    } else if (Buffer.isBuffer(content)) {
      ctx.res.end(content);
    } else if (content instanceof Stream) {
      content.pipe(ctx.res);
    }
  }

  /**
     * Default error handler
     * @param {Object} err
     * @param {Object} ctx
     * @api public
     */
  onerror(err, ctx) {
    if (err.code === "ENOENT") {
      ctx.status = 404;
    } else {
      ctx.status = 500;
    }
    const msg = err.message || "Internal error";
    ctx.res.end(msg);
    this.emit("error", err); // Activate the error
  }
};
