import * as http from "http";
import * as https from "https";
import {colors} from "@spacingbat3/kolor"
import {Key, Keys, pathToRegexp} from "path-to-regexp";

// Utils
import {logger} from "./utils/coreLogger";
import addRoutePrefix from "./utils/routePrefixHandler";
import getRequestBody from "./utils/getRequestBody";

// Types
import type {Request, Response} from "..";
import type {AxonPlugin} from "../types/PluginTypes";
import type {Controller, HttpMethods, JsonResponse, Middleware} from "../types/GlobalTypes";
import type {AxonConfig} from "../types/ConfigTypes";

// Exceptions
import {routeDuplicateException} from "./exceptions/CoreExceptions";

// Instances
import Router from "../Router/AxonRouter";

// Features
import {PluginLoader} from "./plugin/PluginLoader";
import AxonResponse from "./response/AxonResponse";
import AxonCors from "./cors/AxonCors";
import {resolveConfig} from "./config/AxonConfig";

// Default values
const defaultResponses = {
    notFound: "Not found",
    serverError: "Internal server error",
    methodNotAllowed: "Method {method} not allowed"
}

export default class AxonCore {
    private routes: HttpMethods;
    private globalMiddlewares: Middleware[];
    private config: AxonConfig;
    private configsLoaded: boolean;
    private passRoutes: boolean;
    private routesLoaded: boolean;

    private pluginLoader: PluginLoader = new PluginLoader();

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
        
        this.config = {};
        this.configsLoaded = false;
        this.passRoutes = true;
        this.routesLoaded = false;
    }

    /**
     * Loads a specified Axon plugin using the plugin loader.
     *
     * @param {AxonPlugin} plugin - The plugin to be loaded. It should be an instance of AxonPlugin.
     * @example
     * // this class must implements AxonPlugin type
     * class MyPlugin implements AxonPlugin {
     *      name = "plugin"
     *      version = "1.0.0"
     * 
     *      init(core) {}
     * }
     * 
     * core.loadPlugin(new MyPlugin())
     */
    async loadPlugin(plugin: AxonPlugin) {
        await this.pluginLoader.loadPlugin(plugin);
    }

    async #initializePlugins() {
        await this.pluginLoader.initializePlugins(this);
    }

    /**
     * A method to load core configs
     * 
     */
    async #loadConfig() {
        this.config = await resolveConfig();

        this.configsLoaded = true;
    }

    /**
     * loads created routes
     * @param router instance of Router which routes set with it.
     * @param prefix
     * @example
     * const router = Router()
     *
     * router.get('/', async (req, res) => {});
     *
     * core.loadRoute(router) // without prefix
     * core.loadRoute(router, '/api/v1') // with prefix
     */
    async loadRoute(router: Router, prefix?: string) {
        this.passRoutes = false;

        const routerRoutes: HttpMethods = router.exportRoutes();

        (Object.keys(routerRoutes) as Array<keyof HttpMethods>).forEach((method) => {
            if (Object.keys(routerRoutes[method]).length > 0) {
                Object.keys(routerRoutes[method]).forEach((route) => {
                    if (!this.routes[method][route]) {
                        const originalRoute = route

                        if (prefix) {
                            route = addRoutePrefix(route, prefix)
                        }

                        if (route[0] !== "/")
                            route = `/${route}`

                        if (route[route.length - 1] === "/")
                            route = route.slice(0, -1)

                        this.routes[method][route] = routerRoutes[method][originalRoute]
                        this.routes['OPTIONS'][route] = routerRoutes[method][originalRoute];

                        logger.debug(`loaded route ${method} ${route}`)
                    } else {
                        routeDuplicateException(method, route)
                    }
                })
            }
        })

        this.routesLoaded = true;
    }

    /**
     * You can set one or many middlewares in global scope with this method.
     * @example
     * core.globalMiddleware(authMiddleware)
     * core.globalMiddleware([uploadMiddleware, useMiddleware])
     * @param fn
     */
    async globalMiddleware(fn: Middleware | Middleware[]) {
        if (typeof fn === "function") {
            this.globalMiddlewares.push(fn)
        }

        if (typeof fn === "object") {
            for (const middleware of fn) {
                if (typeof middleware === "function") {
                    this.globalMiddlewares.push(middleware);
                }
            }
        }

        logger.debug("global middlewares loaded")
    }

    /**
     * Http request main handler
     * @param req incoming request
     * @param res server response
     * @returns 
     */
    async #handleRequest(req: Request, res: Response) {
        res.status = (code: number) => {
            if (typeof code !== "number") {
                throw new TypeError("response code must be number");
            }

            res.statusCode = code

            return new AxonResponse(res);
        }

        if (!Object.keys(this.routes).includes(req.method as keyof HttpMethods)) {
            return this.response(req, res, {
                body: {
                    message: this.config.RESPONSE_MESSAGES?.methodNotAllowed?.replace("{method}", (req.method as string)) || defaultResponses.methodNotAllowed?.replace("{method}", (req.method as string))
                },
                responseCode: 405
            })
        }

        const method = req.method as keyof HttpMethods

        let findedRoute = false;

        if (Object.keys(this.routes[method]).length === 0) {
            return this.response(req, res, {
                body: {
                    message: this.config.RESPONSE_MESSAGES?.notFound?.replace("{path}", (req.url as string)) || defaultResponses.notFound?.replace("{path}", (req.url as string))
                },
                responseCode: 404
            })
        }

        Object.keys(this.routes[method]).forEach(async (path, index) => {
            let keys: Keys;
            const regexp = pathToRegexp(path);
            keys = regexp.keys

            // Using the WHATWG URL API to get the pathname because url.parse is deprecated and this way is more secure.
            const url = new URL(req.url as string, `http://${req.headers.host}`);
            const pathname = url.pathname;

            const match: RegExpExecArray | null = regexp.regexp.exec(pathname);

            if (match) {
                try {
                    if (!findedRoute) {
                        findedRoute = true

                        const params: Record<string, string | undefined> = {};

                        keys.forEach((key: Key, index: number) => {
                            params[key.name] = match[index + 1];
                        });

                        req.params = params;

                        const route = this.routes[method][path]

                        const middlewares: Middleware[] = route.getMiddlewares();

                        const controller: Controller = route.getController();

                        const axonCors = await AxonCors.middlewareWrapper(this.config.CORS);

                        await this.handleMiddleware(req, res, async () => {
                            await this.handleMiddleware(req, res, async () => {
                                await this.handleMiddleware(req, res, async () => {
                                    await controller(req, res);
                                }, middlewares);
                            }, this.globalMiddlewares);
                        }, [axonCors]);

                        // log incoming requests
                        if (this.config.LOGGER_VERBOSE) {
                            logger.request({
                                ip: req.socket.remoteAddress,
                                url: req.url,
                                method: req.method,
                                headers: req.headers,
                                body: req.body,
                                code: res.statusCode
                            }, "new http request")
                        } else {
                            logger.request(`${req.socket.remoteAddress} - ${req.method} ${req.url} ${res.statusCode} - ${req.headers["user-agent"]}`)
                        }

                    } else {
                        return;
                    }
                } catch (error) {
                    logger.error(error)

                    return this.response(req, res, {
                        body: {
                            message: this.config.RESPONSE_MESSAGES?.serverError || defaultResponses.serverError
                        },
                        responseCode: 500
                    })
                }
            }

            if (!findedRoute && (Object.keys(this.routes[method]).length == (index + 1))) {
                return this.response(req, res, {
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
        next: () => Promise<void>,
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

    private response(req: Request, res: Response, data: JsonResponse) {
        if (data.responseMessage) {
            res.statusMessage = data.responseMessage
        }

        if (typeof data.body !== "object") {
            throw new TypeError(`Response body can't be ${typeof data.body}`)
        }

        if (typeof data.responseCode !== "number") {
            throw new TypeError(`Response code can't be ${typeof data.responseCode}`);
        }

        res.statusCode = data.responseCode

        if (data.headers) {
            for (const key in data.headers) {
                if (data.headers[key]) {
                    res.setHeader(key, data.headers[key])
                }
            }
        }

        // log incoming requests
        if (this.config.LOGGER_VERBOSE) {
            logger.request({
                ip: req.socket.remoteAddress,
                url: req.url,
                method: req.method,
                headers: req.headers,
                body: req.body,
                code: res.statusCode
            }, "New http request")
        } else {
            logger.request(`${req.socket.remoteAddress} - ${req.method} ${req.url} ${res.statusCode} - ${req.headers["user-agent"]}`)
        }

        return res.status(data.responseCode).body(data.body)
    }

    /**
     * Start listening to http incoming requests
     * @param {string} host server host address
     * @param {number} port server port
     * @param {Function} [callback] callback a function to run after starting to listen
     * @example
     * core.listen("0.0.0.0", 80)
     * // or
     * core.listen("0.0.0.0", {
     *      https: 443,
     *      http: 80
     * })
     */
    async listen(host: string = "127.0.0.1", port: number | { https: number, http: number } = 8000, callback?: (mode?: string) => void) {

        // Wait until some necessary items are loaded before starting the server
        const corePreloader = async (): Promise<void> => {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (this.routesLoaded && this.configsLoaded) {
                        logger.info("All plugins and routes loaded");
                        clearInterval(interval);
                        resolve();
                    } else if (this.passRoutes) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        };

        await this.#loadConfig();
        
        await this.#initializePlugins();

        // Wait for necessary items to be loaded
        await corePreloader();

        const httpHandler = async (req: http.IncomingMessage, res: http.ServerResponse) => {
            try {
                await getRequestBody(req)

                this.#handleRequest(req, res)
            } catch (error) {
                logger.error(error, "Unexpected core error")
            }
        }

        const portHandler = (mode: string) => {
            switch (mode) {
                case "http":
                    if (typeof port === "object") {
                        return port.http 
                    } else {
                        return port
                    }
                case "https":
                    if (typeof port === "object") {
                        return port.https
                    } else {
                        return 8443
                    }
                default:
                    return 8000
            }
        }

        const isHttpsActive = () => Object.keys(this.config.HTTPS || {}).length > 0;
        let httpsServer;

        if (isHttpsActive()) {
            httpsServer = https.createServer(this.config.HTTPS || {}, httpHandler);
        }
        const httpServer = http.createServer(httpHandler)

        if (!callback) {
            callback = (mode?: string) => {
                if (mode === "https") {
                    if (isHttpsActive()) {
                        logger.core(colors.whiteBright(`Server started on https://${host}:${portHandler("https")}`));
                    }
                } else if (mode === "http") {
                    logger.core(colors.whiteBright(`Server started on http://${host}:${portHandler("http")}`));
                }
            }
        }

        // running web servers
        httpsServer?.listen(portHandler("https"), host, () => callback("https"));
        httpServer.listen(portHandler("http"), host, () => callback("http"));

        httpsServer?.on('error', (e) => {
            logger.error(e, `Starting server failed`)
            process.exit(-1)
        });

        httpServer.on('error', (e) => {
            logger.error(e, `Starting server failed`)
            process.exit(-1)
        });
    }
}