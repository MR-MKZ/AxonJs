import type { 
    AxonResponseMessage, 
    AxonCorsConfig, 
    AxonHttpsConfig 
} from "./CoreTypes";

interface AxonConfig {
    /**
     * AxonCore debug mode.
     */
    DEBUG?: boolean;
    /**
     * AxonCore logger.
     */
    LOGGER?: boolean;
    /**
     * Verboose mode of logger.
     */
    LOGGER_VERBOSE?: boolean;
    /**
     * Configuration for AxonCore custom response messages.
     */
    RESPONSE_MESSAGES?: AxonResponseMessage;
    /**
     * Cors configuration for AxonCore.
     */
    CORS?: AxonCorsConfig;

    /**
     * Https configuration for AxonCore.
     */
    HTTPS?: AxonHttpsConfig;

    /**
     * A global variable to set default middleware timeout for all routes before breaking the middleware chain.
     * 
     * Default: 10000ms | 10s
     */
    MIDDLEWARE_TIMEOUT?: number;
}

export default AxonConfig;

export {
    AxonConfig
}