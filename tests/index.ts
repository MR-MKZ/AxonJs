/**
 * Typescript simple example
 */

import { HttpRouterCore } from "../src";
import { v1Routes } from "./routes/v1";
import { v2Routes } from "./routes/v2";

const core = new HttpRouterCore()

core.loadConfig({
    DEBUG: true
})

core.loadRoute(v1Routes)
core.loadRoute(v2Routes, "/api/v1")

core.listen(8000, "127.0.0.1", () => {
    console.log("Listening on port 8000");
})