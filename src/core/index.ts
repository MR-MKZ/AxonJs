import Router from "../Router";
import { HttpMethods, JsonResponse } from "../types"
import * as http from "http";
import { routeDuplicateException } from "./CoreExceptions";
import addRoutePrefix from "./utils/routePrefixHandler";
import { AxonCoreConfig } from "./coreTypes";
import { logger } from "./utils/coreLogger";
import { colors } from "@spacingbat3/kolor"
import getRequestBody from "./utils/getRequestBody";
import { Key, pathToRegexp, Keys } from "path-to-regexp";
import { Request, Response, Headers } from "..";

const defaultResponses = {
    notFound: "Not found",
    serverError: "Internal server error",
    methodNotAllowed: "Method not allowed"
}

export default class AxonCore {
    private routes: HttpMethods;
    private config: AxonCoreConfig;
    private configsLoaded: boolean;
    private passConfig: boolean;
    private routesLoaded: boolean;

    constructor() {
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            PATCH: {},
            DELETE: {},
            OPTIONS: {}
        }

        this.config = {
            DEBUG: false,
            LOGGER: true,
            LOGGER_VERBOSE: false,
            RESPONSE_MESSAGES: defaultResponses
        };

        this.configsLoaded = false;
        this.passConfig = true;
        this.routesLoaded = false;
    }

    /**
     * A method to config core as you want
     * 
     * If you want to config the core, use this method before all other methods.
     * @param config core config object
     */
    loadConfig(config: AxonCoreConfig) {
        this.passConfig = false;
        this.config.DEBUG = config.DEBUG || false
        this.config.LOGGER = config.LOGGER || true
        this.config.LOGGER_VERBOSE = config.LOGGER_VERBOSE || false
        this.config.RESPONSE_MESSAGES = { ...config.RESPONSE_MESSAGES }

        if (this.config.DEBUG) {
            logger.level = "debug"
        }

        this.configsLoaded = true;
    }

    /**
     * loads created routes
     * @param router instance of Router which routes setted with it.
     */
    async loadRoute(router: Router, prefix?: string) {
        let routerRoutes: HttpMethods = router.exportRoutes();

        (Object.keys(routerRoutes) as Array<keyof HttpMethods>).forEach((method) => {
            Object.keys(routerRoutes[method]).forEach((route) => {
                if (!this.routes[method][route]) {
                    const originalRoute = route

                    if (prefix) {
                        route = addRoutePrefix(route, prefix)
                    }

                    if (route[0] !== "/")
                        route = `/${route}`

                    this.routes[method][route] = routerRoutes[method][originalRoute]

                    logger.debug(`loaded route ${method} ${route}`)
                } else {
                    routeDuplicateException(method, route)
                }
            })
        })

        this.routesLoaded = true;
    }

    /**
     * Http request main handler
     * @param req incoming request
     * @param res server response
     * @returns 
     */
    async #handleRequest(req: Request, res: Response) {
        // log incoming requests
        if (this.config.LOGGER_VERBOSE) {
            logger.request({
                ip: req.socket.remoteAddress,
                url: req.url,
                method: req.method,
                headers: req.headers,
                body: req.body
            }, "new http request")
        } else {
            logger.request(`${req.socket.remoteAddress} - ${req.method} ${req.url} - ${req.headers["user-agent"]}`)
        }

        if (req.method && !Object.keys(this.routes).includes(req.method)) {
            res.statusCode = 405

            res.write(JSON.stringify({
                message: this.config.RESPONSE_MESSAGES?.methodNotAllowed || defaultResponses.methodNotAllowed
            }));

            return res.end();
        }

        let controller: JsonResponse;

        (Object.keys(this.routes) as Array<keyof HttpMethods>).forEach(async (method) => {
            if (method == req.method) {
                if (req.url) {

                    let findedRoute = false;

                    if (Object.keys(this.routes[method]).length === 0) {
                        res.statusCode = 404
                        res.write(JSON.stringify({
                            message: this.config.RESPONSE_MESSAGES?.notFound || defaultResponses.notFound
                        }))

                        return res.end()
                    }

                    return Object.keys(this.routes[method]).forEach(async (route, index) => {
                        let keys: Keys;
                        const regexp = pathToRegexp(route);
                        keys = regexp.keys
                        const match: RegExpExecArray | null = regexp.regexp.exec(req.url as string);

                        if (match) {
                            try {
                                if (!findedRoute) {
                                    findedRoute = true

                                    const params: Record<string, string | undefined> = {};

                                    keys.forEach((key: Key, index: number) => {
                                        params[key.name] = match[index + 1];
                                    });

                                    req.params = params;

                                    controller = await this.routes[method][route]["controller"](req, res)

                                    if (controller.responseMessage) {
                                        res.statusMessage = controller.responseMessage
                                    }

                                    if (typeof controller.body !== "object") {
                                        throw new TypeError(`Response body can't be ${typeof controller.body}`)
                                    }

                                    if (typeof controller.responseCode !== "number") {
                                        throw new TypeError(`Response code can't be ${typeof controller.responseCode}`);
                                    }

                                    res.statusCode = controller.responseCode

                                    if (controller.headers) {
                                        for (const key in controller.headers) {
                                            if (controller.headers[key]) {
                                                res.setHeader(key, controller.headers[key])
                                            }
                                        }
                                    }

                                    res.write(JSON.stringify(controller.body))

                                    return res.end()
                                } else {
                                    return;
                                }
                            } catch (error) {
                                logger.error(error)

                                res.statusCode = 500
                                res.write(JSON.stringify({
                                    message: this.config.RESPONSE_MESSAGES?.serverError || defaultResponses.serverError
                                }))
                                return res.end()
                            }
                        }

                        if (!findedRoute && (Object.keys(this.routes[method]).length == (index + 1))) {
                            res.statusCode = 404
                            res.write(JSON.stringify({
                                message: this.config.RESPONSE_MESSAGES?.notFound || defaultResponses.notFound
                            }))

                            return res.end()
                        }

                    })
                }
            }
        })
    }

    /**
     * Start listening to http incoming requests
     * @param {string} host server host address
     * @param {number} port server port
     * @param {Function} [callback] callback a function to run after starting to listen
     */
    async listen(host: string, port: number, callback?: () => void) {

        // Wait until some necessary items are loaded before starting the server
        const corePreloader = async (): Promise<void> => {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (this.passConfig) {
                        if (this.routesLoaded) {
                            logger.info("all routes loaded!");
                            clearInterval(interval);
                            resolve();
                        }
                    } else {
                        if (this.routesLoaded && this.configsLoaded) {
                            logger.info("all configs and routes loaded!");
                            clearInterval(interval);
                            resolve();
                        }
                    }
                }, 100);
            });
        };

        // Wait for necessary items to be loaded
        await corePreloader();

        const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
            try {
                await getRequestBody(req)

                this.#handleRequest(req, res)
            } catch (error) {
                logger.error(error, "Unexpected core error")
            }
        })

        if (!callback) {
            callback = () => {
                logger.core(colors.whiteBright(`server started on ${host}:${port}`))
            }
        }

        server.listen(port, host, callback)

        server.on('error', (e) => {
            logger.error(e, `starting server failed`)
            process.exit(-1)
        });
    }
}