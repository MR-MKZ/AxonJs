/**
 * Typescript simple example
 */

import { Axon, Request, Response, NextFunc, axonLogger, Middleware } from '../src';
import { v1Routes } from './routers/v1';
import { v2Routes } from './routers/v2';
import { LogPluginTest } from './plugins/log';

const core = Axon({
  DEBUG: true
});

interface Params {
  id?: string;
}

const testMid: Middleware = async (req: Request<Params>, res: Response, next: NextFunc) => {
  axonLogger.info(`Params: ${JSON.stringify(req.params)}`);
  next();
};

// also you can load multiple global middlewares by putting them in array or set one by one.
// example:
// core.globalMiddleware([testMid, testMid2])
core.globalMiddleware(testMid, 500, true);

core.loadRoute(v1Routes);
core.loadRoute(v2Routes);

// using plugins for more flexible code and also using ready codes to develop faster than past.
// you can make your own plugins with AxonPlugin interface.
core.loadPlugin(new LogPluginTest());

// callback function is optional and core has default log message for on start event
// host default is 127.0.0.1 and port default is 8000
core.listen('127.0.0.1', 3000, () => {
  axonLogger.core('Axon app runned successfully :)');
});
