// types
import type { AxonConfig } from "../../types/ConfigTypes";

export default {
    PROJECT_ENV: "development",
    DEBUG: false,
    LOGGER: true,
    LOGGER_VERBOSE: false,
    RESPONSE_MESSAGES: {
        notFound: "Not found",
        serverError: "Internal server error",
        methodNotAllowed: "Method {method} not allowed"
    },
    CORS: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false
    },
    HTTPS: {}
} as AxonConfig;