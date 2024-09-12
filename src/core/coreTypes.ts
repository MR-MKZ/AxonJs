interface AxonCoreConfig {
    DEBUG?: boolean;
    LOGGER?: boolean;
    LOGGER_VERBOSE?: boolean;
    RESPONSE_MESSAGES?: AxonResponseMessage;
}

interface AxonResponseMessage {
    /**
     * response error message for 404 not found response from core
     */
    notFound?:  string;
    /**
     * response error message for 500 internal server error response from core
     */
    serverError?:  string;
    /**
     * response error message for 405 method not allowed response from core
     */
    methodNotAllowed?: string;
    [key: string]: string | undefined;
}

export {
    AxonCoreConfig,
    AxonResponseMessage
}