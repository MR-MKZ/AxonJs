import * as http from "http";
import * as https from "https";
import { colors } from "@spacingbat3/kolor"
// import { Key, Keys, pathToRegexp } from "path-to-regexp";

// Utils
import { logger } from "./utils/coreLogger";
import getRequestBody from "./utils/getRequestBody";

// Types
import type { FuncController, Request, Response, Middleware, HttpMethods } from "..";
import type { AxonPlugin } from "../types/PluginTypes";
import type { JsonResponse } from "../types/GlobalTypes";
import type { AxonConfig } from "../types/ConfigTypes";
import type { UnloadRouteParams } from "../types/CoreTypes";

// Exceptions
import { routeDuplicateException } from "./exceptions/CoreExceptions";

// Instances
import Router from "../Router/AxonRouter";

// Features
import { PluginLoader } from "./plugin/PluginLoader";
import AxonResponse from "./response/AxonResponse";
import AxonCors from "./cors/AxonCors";
import { resolveConfig } from "./config/AxonConfig";
import { unloadRouteService, unloadRoutesService } from "./services/unloadRoutesService";

// Default values
const defaultResponses = {
    notFound: "Not found",
    serverError: "Internal server error",
    methodNotAllowed: "Method {method} not allowed"
}

export default class AxonCore {
    /**
     * @description The routes object that contains all the routes for the server.
     */
    private routes: HttpMethods;

    /**
     * @description The global middlewares that will be applied to all the routes.
     */
    private globalMiddlewares: Middleware[];

    /**
     * @description The config object that contains all the config for the server.
     */
    private config: AxonConfig;

    /**
     * @description Whether the configs are loaded or not.
     */
    private configsLoaded: boolean;

    /**
     * @description Whether the routes are passed or not.
     */
    private passRoutes: boolean;

    /**
     * @description Whether the routes are loaded or not.
     */
    private routesLoaded: boolean;

    /**
     * @description The regex for the query params.
     */
    private queryParamsRegex: RegExp;

    /**
     * @description The plugin loader instance.
     */
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

        this.queryParamsRegex = /[?&]([^=]+)=([^&]+)/g;
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
     * const router = Router(); // without prefix
     * const router2 = Router("/api/v1"); // with prefix
     *
     * router.get('/', async (req, res) => {});
     *
     * core.loadRoute(router);
     */
    async loadRoute(router: Router) {
        this.passRoutes = false;

        // TODO: Add route regex in AxonRouter and remove path-to-regexp and also prevent string processing while checking user response to save more time for response.

        const routerRoutes: HttpMethods = router.exportRoutes();

        // this.routes = routerRoutes;

        // if (this.config.DEBUG) {
        //     logger.debug(routerRoutes)
        // }

        (Object.keys(routerRoutes) as Array<keyof HttpMethods>).forEach((method) => {
            if (Object.keys(routerRoutes[method]).length > 0) {
                Object.keys(routerRoutes[method]).forEach((route) => {
                    if (!this.routes[method][route]) {
                        this.routes[method][route] = routerRoutes[method][route];
                        this.routes['OPTIONS'][route] = routerRoutes[method][route];

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
     * unload routes based on entered parameters
     * @param route
     * @param method
     * @param router
     * @example
     * // this one unloads a route with path `/api/v1/user`.
     * core.unloadRoute({
     *     route: '/api/v1/user'
     * });
     *
     * // this one unloads all  routes with method `GET`
     * core.unloadRoute({
     *     method: 'GET'
     * });
     *
     * const userRouter = Router();
     *
     * // this one unloads all routes of userRouter.
     * core.unloadRoute({
     *     router: userRouter
     * });
     *
     * // this one unloads a route with path `/api/v1/user`, all routes with method `GET` and all routes of userRouter.
     * core.unloadRoute({
     *     route: '/api/v1/user',
     *     method: "GET",
     *     router: userRouter
     * })
     */
    async unloadRoute({ route, method, router }: UnloadRouteParams) {
        await unloadRouteService({ _routes: this.routes, route, router, method });
    }

    /**
     * unload all routes
     * @example
     * core.unloadRoutes();
     */
    async unloadRoutes() {
        await unloadRoutesService(this.routes)
    }

    /**
     * You can set one or many middlewares in global scope with this method.
     * @example
     * core.globalMiddleware(authMiddleware)
     * core.globalMiddleware([uploadMiddleware, userMiddleware])
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
    async #handleRequest(req: Request<any>, res: Response) {
        res.status = (code: number) => {
            res.statusCode = code

            return new AxonResponse(res);
        }

        if (!Object.keys(this.routes).includes(req.method as keyof HttpMethods)) {
            return this.response(req, res, {
                body: {
                    message: 
                        this.config.RESPONSE_MESSAGES?.methodNotAllowed?.replace("{method}", (req.method as string))
                        || defaultResponses.methodNotAllowed?.replace("{method}", (req.method as string))
                },
                responseCode: 405
            })
        }
        
        const method = req.method as keyof HttpMethods

        let foundRoute = false;

        if (Object.keys(this.routes[method]).length === 0) {
            return this.response(req, res, {
                body: {
                    message: 
                        this.config.RESPONSE_MESSAGES?.notFound?.replace("{path}", (req.url as string)) 
                        || defaultResponses.notFound?.replace("{path}", (req.url as string))
                },
                responseCode: 404
            })
        }

        for (const path of Object.keys(this.routes[method])) {
            const index = Object.keys(this.routes[method]).indexOf(path);

            // convert request url from string | undefined to string
            const pathname = req.url as string;

            // Strip query parameters from pathname before matching
            const pathnameWithoutQuery = pathname.split('?')[0];

            const match = this.routes[method][path]["regex"].exec(pathnameWithoutQuery);

            if (match) {
                try {
                    if (!foundRoute) {
                        foundRoute = true

                        const route = this.routes[method][path];

                        // logger.coreDebug([path, pathname, req.url, this.routes[method][path]["paramNames"]]);

                        const params: Record<string, string | undefined> = {};
                        const queryParams: Record<string, string | undefined> = {};

                        route["paramNames"].forEach((key: string, index: number) => {
                            params[key] = match[index + 1];
                        });

                        let queryParamsMatch: RegExpExecArray | null;

                        while ((queryParamsMatch = this.queryParamsRegex.exec(pathname)) !== null) {
                            const [_, key, value] = queryParamsMatch;
                            queryParams[decodeURIComponent(key)] = decodeURIComponent(value);
                        }

                        req.params = params;
                        req.query = queryParams;

                        const middlewares: Middleware[] = route["handler"]["_middlewares"];

                        const controller: FuncController = route["handler"]["_controller"];

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
                        continue;
                    }
                } catch (error) {
                    logger.error(error)

                    this.response(req, res, {
                        body: {
                            message: this.config.RESPONSE_MESSAGES?.serverError ||
                            defaultResponses.serverError
                        },
                        responseCode: 500
                    });
                }
            }

            if (!foundRoute && (Object.keys(this.routes[method]).length == (index + 1))) {
                this.response(req, res, {
                    body: {
                        message: this.config.RESPONSE_MESSAGES?.notFound?.replace("{path}", (req.url as string)) ||
                        defaultResponses.notFound?.replace("{path}", (req.url as string))
                    },
                    responseCode: 404
                });
            }

        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @param middlewares
     */
    private async handleMiddleware(
        req: Request<any>,
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

    private response(req: Request<any>, res: Response, data: JsonResponse) {
        if (data.responseMessage) {
            res.statusMessage = data.responseMessage
        }

        if (typeof data.body !== "object") {
            throw new TypeError(`Response body can't be ${typeof data.body}`)
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
                await getRequestBody(req as Request<any>);

                this.#handleRequest(req as Request<any>, res as Response)
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
                
                if (this.config.LOGGER) {
                    logger.level = "plugin"
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