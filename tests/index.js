/**
 * Javascript simple example with controller return code completion.
 */

import { HttpRouterCore, Router } from "../src";

const core = new HttpRouterCore();

/**
 * @type {import("../src").AxonCoreConfig}
 */
core.loadConfig({
    DEBUG: true
})

const router = Router();
const router2 = Router();

/**
 * @returns {import("../src").JsonResponse}
 */
const controller = async () => {
    return {
        body: {
            message: "Hello, World"
        },
        responseCode: 200
    }
}

router.get('/', controller);

router2.get('/hello', controller);

// second parameter is route prefix which for example change your route from /hello to /api/v1/hello. (Route prefix is optional)
core.loadRoute(router, '/api/v1')
core.loadRoute(router2)

core.listen(8000, "127.0.0.1", () => {
    console.log("Listening on port 8000 ...");
})