import Router from "../Router";
import { HttpMethods, JsonResponse, CoreReq } from "../types"
import * as http from "http";
import { routeDuplicateException } from "./CoreExceptions";
import addRoutePrefix from "./utils/routePrefixHandler";
import { AxonCoreConfig } from "./coreTypes";
import { logger } from "./utils/coreLogger";

export default class HttpRouterCore {
    private routes: HttpMethods;
    private config: AxonCoreConfig;

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
            DEBUG: false
        };
    }

    /**
     * A method to config core as you want
     * 
     * If you want to config the core, use this method before all other methods.
     * @param config core config object
     */
    loadConfig(config: AxonCoreConfig) {
        this.config.DEBUG = config.DEBUG || false

        if (this.config.DEBUG) {
            logger.level = "debug"
        }
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
    }

    /**
     * Http request main handler
     * @param req incoming request
     * @param res server response
     * @returns 
     */
    async #handleRequest(req: CoreReq, res: http.ServerResponse) {
        console.log(req.http.url, req.http.method, req.http.headers);

        if (req.http.method && !Object.keys(this.routes).includes(req.http.method)) {
            res.statusCode = 405

            res.write(JSON.stringify({
                msg: `Method ${req.http.method} not allowed`
            }));

            return res.end();
        }

        let controller: JsonResponse;

        (Object.keys(this.routes) as Array<keyof HttpMethods>).forEach(async (method) => {
            if (method == req.http.method) {
                if (req.http.url) {
                    try {
                        controller = await this.routes[method][req.http.url]["controller"]()

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

    async #responseHandler(req: CoreReq, res: http.ServerResponse) {

    }

    /**
     * Start listening to http incoming requests
     * @param port server port
     * @param callback a function to run after starting to listen
     */
    async listen(port: number, host: string, callback: () => void) {
        const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
            let requestBody: string = "";

            req.on('data', (chunk: string) => {
                requestBody += chunk
            })

            req.on('end', () => {
                logger.debug(JSON.parse(requestBody), "request body")
                this.#handleRequest({ http: req, body: requestBody }, res)
            })
        })

        server.listen(port, host, callback)

        server.on('error', (e) => {
            logger.error(e, `starting server failed`)
            process.exit(-1)
        });
    }

}