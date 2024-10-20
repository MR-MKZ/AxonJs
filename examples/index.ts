/**
 * Typescript simple example
 */

import { AxonCore, Request, Response, nextFn } from "../src";
import { v1Routes } from "./routes/v1";
import { v2Routes } from "./routes/v2";
import { LogPluginTest } from "./plugins/log";

const core = new AxonCore()

core.loadConfig({
    DEBUG: true,            // default false
    LOGGER: true,           // default true
    LOGGER_VERBOSE: false,  // default false
    RESPONSE_MESSAGES: {
        notFound: "route '{path}' not found"
    }
})

const testMid = async (req: Request, res: Response, next: nextFn) => {
    
    core.plugin.log.log();

    next()
}

// also you can load multiple global middlewares by putting them in array or set one by one.
// example:
// core.globalMiddleware([testMid, testMid2])
core.globalMiddleware(testMid);

core.loadRoute(v1Routes)
core.loadRoute(v2Routes, "/api/v1")

core.usePlugin('log', new LogPluginTest());

// callback function is optional and core has default log message for on start event
// host default is 127.0.0.1 and port default is 8000
core.listen("127.0.0.1", 3000)