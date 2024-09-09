import Router from "../Router";
import { HttpMethods, JsonResponse, CoreReq } from "../types"
import * as http from "http";
import { routeDuplicateException } from "./CoreExceptions";
import addRoutePrefix from "./utils/routePrefixHandler";
import { AxonCoreConfig } from "./coreTypes";
import { logger } from "./utils/coreLogger";
import { colors } from "@spacingbat3/kolor"
import getRequestBody from "./utils/getRequestBody";

export default class AxonCore {
    private routes: HttpMethods;
    private config: AxonCoreConfig;
    private configsLoaded: boolean;
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
            LOGGER_VERBOSE: false
        };

        this.configsLoaded = false;
        this.routesLoaded = false;
    }

    /**
     * A method to config core as you want
     * 
     * If you want to config the core, use this method before all other methods.
     * @param config core config object
     */
    loadConfig(config: AxonCoreConfig) {
        this.config.DEBUG = config.DEBUG || false
        this.config.LOGGER = config.LOGGER || true
        this.config.LOGGER_VERBOSE = config.LOGGER_VERBOSE || false

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
    async #handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
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
                msg: `Method ${req.method} not allowed`
            }));

            return res.end();
        }

        let controller: JsonResponse;

        (Object.keys(this.routes) as Array<keyof HttpMethods>).forEach(async (method) => {
            if (method == req.method) {
                if (req.url) {
                    try {
                        controller = await this.routes[method][req.url]["controller"]()

                        if (controller.responseMessage) {
                            res.statusMessage = controller.responseMessage
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
                    } catch (error) {
                        if (error instanceof TypeError) {
                            res.statusCode = 404
                            res.write(JSON.stringify({
                                message: "Not found"
                            }))

                            return res.end()
                        }
                        res.statusCode = 500
                        res.write(JSON.stringify({
                            message: "Internal Server Error"
                        }))

                        return res.end()
                    }
                }
            }
        })
    }

    async #responseHandler(req: CoreReq, res: http.ServerResponse) { }


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
                    if (this.routesLoaded && this.configsLoaded) {
                        clearInterval(interval);
                        resolve();
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