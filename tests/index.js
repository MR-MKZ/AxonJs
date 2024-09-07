/**
 * Javascript simple example with controller return code completion.
 */

import { HttpRouterCore, Router } from "@mr-mkz/http-router";

const core = new HttpRouterCore();

const router = new Router();

/**
 * @returns {import("@mr-mkz/http-router").JsonResponse}
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