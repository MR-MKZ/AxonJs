import type { 
    AxonResponseMessage, 
    AxonCorsConfig, 
    AxonHttpsConfig 
} from "@/types/CoreTypes";

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
     * @default 10000ms | 10s
     */
    MIDDLEWARE_TIMEOUT?: number;

    /**
     * Project environment type to manage features more secure and automatically in AxonCore.
     * 
     * @default development
     */
    PROJECT_ENV?: "development" | "production";
}

export default AxonConfig;

export {
    AxonConfig
}