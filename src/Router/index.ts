import RouterException from "../error/RouterException";
import { HttpMethods, JsonResponse } from "../types";
import * as http from "http";

const duplicateError = (path: string) => {
    throw new RouterException({
        msg: "Duplicated route!",
        name: "RouterError -> DUPLICATED_ROUTE",
        meta: {
            type: "DUPLICATED_ROUTE",
            description: `route "GET ${path}" is duplicated`
        }
    })
}

class AxonRouter {
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
     * Endpoint with method GET
     * 
     * The purpose of the GET method is to simply retrieve data from the server. The GET method is used to request any of the following resources:
     * - A webpage or HTML file.
     * - An image or video.
     * - A JSON document.
     * - A CSS file or JavaScript file.
     * - An XML file.
     * @param path route path
     * @param controller route request controller
     */
    get(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {
        if (this.routes.GET[path]) {
            duplicateError(path)
        }
        
        this.routes.GET[path] = {
            controller: controller
        }
    }

    /**
     * Endpoint with method POST
     * 
     * The POST HTTP request method sends data to the server for processing.
     * 
     * The data sent to the server is typically in the following form:
     * - Input fields from online forms.
     * - XML or JSON data.
     * - Text data from query parameters.
     * @param path route path
     * @param controller route request controller
     */
    post(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {
        if (this.routes.POST[path]) {
            duplicateError(path)
        }

        this.routes.POST[path] = {
            controller: controller

        }
    }

    /**
     * Endpoint with method PUT
     * 
     * The PUT HTTP request method sends data to the server for replacing and changing full state.
     * @param path route path
     * @param controller route request controller
     */
    put(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {
        if (this.routes.PUT[path]) {
            duplicateError(path)
        }

        this.routes.PUT[path] = {
            controller: controller
        }
    }

    /**
     * Endpoint with method PATCH
     * 
     * The PATCH HTTP request method sends data to the server for editing part of a data.
     * @param path route path
     * @param controller route request controller
     */
    patch(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {
        if (this.routes.PATCH[path]) {
            duplicateError(path)
        }

        this.routes.PATCH[path] = {
            controller: controller
        }
    }

    /**
     * Endpoint with method DELETE
     * 
     * The DELETE HTTP request method sends data to the server for deleting a data.
     * @param path route path
     * @param controller route request controller
     */
    delete(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {
        if (this.routes.DELETE[path]) {
            duplicateError(path)
        }

        this.routes.DELETE[path] = {
            controller: controller
        }
    }

    /**
     * Endpoint with method OPTIONS
     * 
     * The HTTP OPTIONS method returns a listing of which HTTP methods are supported and allowed.
     * @param path route path
     * @param controller route request controller
     */
    options(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {
        if (this.routes.OPTIONS[path]) {
            duplicateError(path)
        }

        this.routes.OPTIONS[path] = {
            controller: controller
        }
    }

    exportRoutes() {
        return this.routes
    }
}

export default AxonRouter;