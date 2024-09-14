interface AxonCoreConfig {
    DEBUG?: boolean;
    LOGGER?: boolean;
    LOGGER_VERBOSE?: boolean;
    RESPONSE_MESSAGES?: AxonResponseMessage;
}

interface AxonResponseMessage {
    /**
     * response error message for 404 not found response from core
     * 
     * use `{path}` to show request method.
     */
    notFound?:  string;
    /**
     * response error message for 500 internal server error response from core
     */
    serverError?:  string;
    /**
     * response error message for 405 method not allowed response from core
     * 
     * use `{method}` to show request method.
     * 
     * example:
     * - config: 'Method {method} is not allowed'
     * - response: 'Method TRACE is not allowed'
     */
    methodNotAllowed?: string;
    [key: string]: string | undefined;
}

export {
    AxonCoreConfig,
    AxonResponseMessage
}