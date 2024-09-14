import Router from "../Router/AxonRouter";
import { Controller, HttpMethods, JsonResponse, Middleware } from "../types"
import * as http from "http";
import { routeDuplicateException } from "./CoreExceptions";
import addRoutePrefix from "./utils/routePrefixHandler";
import { AxonCoreConfig } from "./coreTypes";
import { logger } from "./utils/coreLogger";
import { colors } from "@spacingbat3/kolor"
import getRequestBody from "./utils/getRequestBody";
import { Key, pathToRegexp, Keys } from "path-to-regexp";
import { Request, Response, Headers } from "..";
import AxonResponse from "./AxonResponse";

const defaultResponses = {
    notFound: "Not found",
    serverError: "Internal server error",
    methodNotAllowed: "Method {method} not allowed"
}

export default class AxonCore {
    private routes: HttpMethods;
    private globalMiddlewares: Middleware[];
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

        this.globalMiddlewares = [];

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
        this.config.LOGGER = config.LOGGER;
        this.config.LOGGER_VERBOSE = config.LOGGER_VERBOSE || false
        this.config.RESPONSE_MESSAGES = { ...config.RESPONSE_MESSAGES }

        if (this.config.DEBUG) {
            logger.level = "debug"
        }

        if (!this.config.LOGGER) {
            logger.level = "silent"
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

    async globalMiddleware(fn: Middleware | Middleware[]) {
        if (typeof fn === "function") {
            this.globalMiddlewares.push(fn)
        }

        if (typeof fn === "object") {
            for (let middleware of fn) {
                if (typeof middleware === "function") {
                    this.globalMiddlewares.push(middleware);
                }
            }
        }

        logger.debug("loaded global middlewares")
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

        res.status = (code: number) => {
            if (typeof code !== "number") {
                throw new TypeError("response code must be number");
            }

            res.statusCode = code

            return new AxonResponse(res);
        }

        if (!Object.keys(this.routes).includes(req.method as keyof HttpMethods)) {
            return this.response(res, {
                body: {
                    message: this.config.RESPONSE_MESSAGES?.methodNotAllowed?.replace("{method}", (req.method as string)) || defaultResponses.methodNotAllowed?.replace("{method}", (req.method as string))
                },
                responseCode: 405
            })
        }

        const method = req.method as keyof HttpMethods

        let findedRoute = false;

        if (Object.keys(this.routes[method]).length === 0) {
            return this.response(res, {
                body: {
                    message: this.config.RESPONSE_MESSAGES?.notFound?.replace("{path}", (req.url as string)) || defaultResponses.notFound?.replace("{path}", (req.url as string))
                },
                responseCode: 404
            })
        }

        return Object.keys(this.routes[method]).forEach(async (path, index) => {
            let keys: Keys;
            const regexp = pathToRegexp(path);
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

                        let route = this.routes[method][path]

                        let middlewares: Middleware[] = route.getMiddlewares();

                        let controller: Controller = route.getController();

                        return await this.handleMiddleware(req, res, async () => {
                            return await this.handleMiddleware(req, res, async () => {
                                await controller(req, res);
                            }, middlewares);
                        }, this.globalMiddlewares);

                    } else {
                        return;
                    }
                } catch (error) {
                    logger.error(error)

                    return this.response(res, {
                        body: {
                            message: this.config.RESPONSE_MESSAGES?.serverError || defaultResponses.serverError
                        },
                        responseCode: 500
                    })
                }
            }

            if (!findedRoute && (Object.keys(this.routes[method]).length == (index + 1))) {
                return this.response(res, {
                    body: {
                        message: this.config.RESPONSE_MESSAGES?.notFound?.replace("{path}", (req.url as string)) || defaultResponses.notFound?.replace("{path}", (req.url as string))
                    },
                    responseCode: 404
                })
            }

        })
    }

    /**
     * 
     * @param req 
     * @param res 
     * @param next 
     * @param middlewares 
     */
    private async handleMiddleware(
        req: Request,
        res: Response,
        next: () => Promise<any>,
        middlewares: Middleware[]
    ) {
        let index = 0;

        const executeMiddleware = async () => {
            if (index < middlewares.length) {
                const middleware = middlewares[index++];

                await middleware(req, res, executeMiddleware);
            } else {
                await next();
            }
        };

        await executeMiddleware();
    }

    private response(res: Response, data: JsonResponse) {
        if (data.responseMessage) {
            res.statusMessage = data.responseMessage
        }

        if (typeof data.body !== "object") {
            throw new TypeError(`Response body can't be ${typeof data.body}`)
        }

        if (typeof data.responseCode !== "number") {
            throw new TypeError(`Response code can't be ${typeof data.responseCode}`);
        }

        if (data.headers) {
            for (const key in data.headers) {
                if (data.headers[key]) {
                    res.setHeader(key, data.headers[key])
                }
            }
        }
        return res.status(data.responseCode).body(JSON.stringify(data.body))
    }

    /**
     * Start listening to http incoming requests
     * @param {string} host server host address
     * @param {number} port server port
     * @param {Function} [callback] callback a function to run after starting to listen
     */
    async listen(host: string = "127.0.0.1", port: number = 8000, callback?: () => void) {

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