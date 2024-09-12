/**
 * Typescript simple example
 */

import { AxonCore } from "../src";
import { v1Routes } from "./routes/v1";
import { v2Routes } from "./routes/v2";

const core = new AxonCore()

core.loadConfig({
    DEBUG: true,            // default false
    LOGGER: true,           // default true
    LOGGER_VERBOSE: false,  // default false
    RESPONSE_MESSAGES: {
        notFound: "route not found"
    }
})

core.loadRoute(v1Routes)
core.loadRoute(v2Routes, "/api/v1")

// callback function is optional and core has default log message for on start event
core.listen("127.0.0.1", 8000)