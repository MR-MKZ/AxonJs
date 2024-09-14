import RouterException from "../error/RouterException";
import { Controller, HttpMethods, Middleware } from "../types";

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

export class AxonRouteHandler {  
    private controller: Controller;  
    private middlewares: Middleware[];  

    constructor(controller: Controller) {  
        this.controller = controller;  
        this.middlewares = [];  
    }  

    middleware(fn: Middleware) {  
        this.middlewares.push(fn);
        return this;
    }  

    getController() {  
        return this.controller;  
    }  

    getMiddlewares() {  
        return this.middlewares;  
    }  
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
    public get(path: string, controller: Controller) {
        if (this.routes.GET[path]) {
            duplicateError(path)
        }
        
        const handler = new AxonRouteHandler(controller);
        this.routes.GET[path] = handler

        return handler;
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
    public post(path: string, controller: Controller) {
        if (this.routes.POST[path]) {
            duplicateError(path)
        }

        const handler = new AxonRouteHandler(controller);
        this.routes.POST[path] = handler

        return handler;
    }

    /**
     * Endpoint with method PUT
     * 
     * The PUT HTTP request method sends data to the server for replacing and changing full state.
     * @param path route path
     * @param controller route request controller
     */
    public put(path: string, controller: Controller) {
        if (this.routes.PUT[path]) {
            duplicateError(path)
        }

        const handler = new AxonRouteHandler(controller);
        this.routes.PUT[path] = handler

        return handler;
    }

    /**
     * Endpoint with method PATCH
     * 
     * The PATCH HTTP request method sends data to the server for editing part of a data.
     * @param path route path
     * @param controller route request controller
     */
    public patch(path: string, controller: Controller) {
        if (this.routes.PATCH[path]) {
            duplicateError(path)
        }

        const handler = new AxonRouteHandler(controller);
        this.routes.PATCH[path] = handler

        return handler;
    }

    /**
     * Endpoint with method DELETE
     * 
     * The DELETE HTTP request method sends data to the server for deleting a data.
     * @param path route path
     * @param controller route request controller
     */
    public delete(path: string, controller: Controller) {
        if (this.routes.DELETE[path]) {
            duplicateError(path)
        }

        const handler = new AxonRouteHandler(controller);
        this.routes.DELETE[path] = handler

        return handler;
    }

    /**
     * Endpoint with method OPTIONS
     * 
     * The HTTP OPTIONS method returns a listing of which HTTP methods are supported and allowed.
     * @param path route path
     * @param controller route request controller
     */
    public options(path: string, controller: Controller) {
        if (this.routes.OPTIONS[path]) {
            duplicateError(path)
        }

        const handler = new AxonRouteHandler(controller);
        this.routes.OPTIONS[path] = handler

        return handler;
    } 

    exportRoutes() {
        return this.routes
    }
}

export default AxonRouter;