/**
 * Javascript simple example with controller return code completion.
 */

import { HttpRouterCore, Router } from "../src";

const core = new HttpRouterCore();

const router = new Router();

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

router.get('/', controller)

core.loadRoute(router)

core.listen(8000, () => {
    console.log("Listening on port 8000 ...");
})