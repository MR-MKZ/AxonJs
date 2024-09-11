/**
 * Javascript simple example with controller return code completion.
 */

import { AxonCore, Router } from "../src";

const core = new AxonCore();

/**
 * @type {import("../src").AxonCoreConfig}
 */
core.loadConfig({
    DEBUG: true,            // default false
    LOGGER: true,           // default true
    LOGGER_VERBOSE: false   // default false
})

const router = Router();
const router2 = Router();

/**
 * 
 * @param {import("../src").Request} req 
 * @param {import("../src").Response} res 
 * @returns {import("../src").JsonResponse}
 */
const controller = async (req, res) => {

    console.log(req.url);    

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

// callback function is optional and core has default log message for on start event
core.listen("127.0.0.1", 8000)