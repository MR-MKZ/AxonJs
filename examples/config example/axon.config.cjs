const path = require("path");
const fs = require("fs");

/**
 * @type {import("../../src").AxonConfig}
 */
module.exports = {
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
};