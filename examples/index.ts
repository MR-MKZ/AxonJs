/**
 * Typescript simple example
 */

import { Axon, Request, Response, nextFn } from "../src";
import { v1Routes } from "./routes/v1";
import { v2Routes } from "./routes/v2";
import { LogPluginTest } from "./plugins/log";

const core = Axon()

const testMid = async (req: Request, res: Response, next: nextFn) => {
    next()
}

// also you can load multiple global middlewares by putting them in array or set one by one.
// example:
// core.globalMiddleware([testMid, testMid2])
core.globalMiddleware(testMid);

core.loadRoute(v1Routes)
core.loadRoute(v2Routes, "/api/v1")

// using plugins for more flexible code and also using ready codes to develop faster than past.
// you can make your own plugins with AxonPlugin interface.
core.loadPlugin(new LogPluginTest());

// callback function is optional and core has default log message for on start event
// host default is 127.0.0.1 and port default is 8000
core.listen("127.0.0.1", 3000)