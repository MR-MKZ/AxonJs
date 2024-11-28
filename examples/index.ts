/**
 * Typescript simple example
 */

import { Axon, Request, Response, nextFn } from "../src";
import { v1Routes } from "./routes/v1";
import { v2Routes } from "./routes/v2";
import { LogPluginTest } from "./plugins/log";
import path from "path";
import fs from "fs";

const core = Axon()

core.loadConfig({
    DEBUG: false,            // default false
    LOGGER: true,           // default true
    LOGGER_VERBOSE: false,  // default false
    RESPONSE_MESSAGES: {
        notFound: "route '{path}' not found"
    },
    CORS: {
        origin: 'https://github.com'
    },
    HTTPS: {
        key: fs.readFileSync(path.join("examples", "server.key")),
        cert: fs.readFileSync(path.join("examples", "server.crt"))
    }
})

const testMid = async (req: Request, res: Response, next: nextFn) => {
    next()
}

// also you can load multiple global middlewares by putting them in array or set one by one.
// example:
// core.globalMiddleware([testMid, testMid2])
core.globalMiddleware(testMid);

core.loadRoute(v1Routes)
core.loadRoute(v2Routes, "/api/v1")

// using plugins for more flexible code and also using ready codes to develope faster than past.
// you can make your own plugins with AxonPlugin interface.
core.loadPlugin(new LogPluginTest());

// callback function is optional and core has default log message for on start event
// host default is 127.0.0.1 and port default is 8000
core.listen("127.0.0.1", 3000)