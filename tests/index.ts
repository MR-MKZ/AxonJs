/**
 * Typescript simple example
 */

import { HttpRouterCore, Router } from "@mr-mkz/http-router";

const core = new HttpRouterCore()

const router = new Router();

router.get('/', async () => {
    return {
        body: {
            message: "Hello, World"
        },
        responseCode: 200
    }
})

core.loadRoute(router)

core.listen(8000, () => {
    console.log("Listening on port 8000");
})