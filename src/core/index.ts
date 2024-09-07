import Router from "../Router";
import { HttpMethods, JsonResponse, CoreReq } from "../types"
import * as http from "http";
import { routeDuplicateException } from "./CoreExceptions";

export default class HttpRouterCore {
    private routes: HttpMethods;

    constructor() {
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            PATCH: {},
            DELETE: {},
            OPTIONS: {}
        }
    }

    /**
     * loads created routes
     * @param router instance of Router which routes setted with it.
     */
    async loadRoute(router: Router) {
        let routerRoutes: HttpMethods = router.exportRoutes();

        (Object.keys(routerRoutes) as Array<keyof HttpMethods>).forEach((method) => {
            Object.keys(routerRoutes[method]).forEach((route) => {
                if (!this.routes[method][route]) {
                    this.routes[method][route] = routerRoutes[method][route]
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
    async listen(port: number, callback: () => void) {
        const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
            let requestBody: string = "";

            req.on('data', (chunk: string) => {
                requestBody += chunk
            })

            req.on('end', () => {
                this.#handleRequest({ http: req, body: requestBody }, res)
            })
        })

        server.listen(port, callback)
    }

}