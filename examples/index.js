/**
 * Javascript simple example with controller return code completion.
 */

import { Axon, Router } from '../src';

const core = Axon();

const router = Router('/api/v1');

/**
 * @typedef {Object} Params
 * @property {string?} id
 *
 * if you want type defenition for req.params you can add this part but if you don't need it you can remove it and req.paramss will be any type.
 */

/**
 *
 * @param {import("../src").Request<Params>} req
 * @param {import("../src").Response} res
 */
const controller = async (req, res) => {
  req.params.id;
  return res.status(200).body({
    message: 'Hello, World',
  });
};

/**
 *
 * @param {import("../src").Request} req
 * @param {import("../src").Response} res
 * @param {import("../src").nextFn} next
 */
const testMid = (req, res, next) => {
  console.log('global middleware 1');

  next();
};

// also you can add one or multiple middlewares for specific route like this.
// you can add another middleware by repeating this function. they will run in order.
// example: router.get().middleware().middleware()
router.get('/', controller).middleware(async (req, res, next) => {
  console.log("middleware for route '/' with method GET");

  next();
});

// also you can load multiple global middlewares by putting them in array or set one by one.
// example:
// core.globalMiddleware([testMid, testMid2])
core.globalMiddleware(testMid);

// second parameter is route prefix which for example change your route from /hello to /api/v1/hello. (Route prefix is optional)
core.loadRoute(router);

// callback function is optional and core has default log message for on start event
// host default is 127.0.0.1 and port default is 8000
core.listen('127.0.0.1', 8000);
