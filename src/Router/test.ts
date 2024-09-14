// import RouterException from "../error/RouterException";  
// import { HttpMethods, JsonResponse } from "../types";  
// import * as http from "http";  

// const duplicateError = (path: string) => {  
//     throw new RouterException({  
//         msg: "Duplicated route!",  
//         name: "RouterError -> DUPLICATED_ROUTE",  
//         meta: {  
//             type: "DUPLICATED_ROUTE",  
//             description: `route "GET ${path}" is duplicated`  
//         }  
//     });  
// }  

// type Middleware = (req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => Promise<void>;  

// class AxonRouter {  
//     private routes: HttpMethods;  
//     private currentMethod: string | null = null;  
//     private middlewares: Middleware[] = [];  

//     constructor() {  
//         this.routes = {  
//             GET: {},  
//             POST: {},  
//             PUT: {},  
//             PATCH: {},  
//             DELETE: {},  
//             OPTIONS: {}  
//         };  
//     }  

//     private setCurrentMethod(method: string) {  
//         if (this.currentMethod !== null) {  
//             throw new Error(`Cannot switch to another method from ${this.currentMethod}`);  
//         }  
//         this.currentMethod = method;  
//     }  

//     private resetCurrentMethod() {  
//         this.currentMethod = null;  
//     }  

//     public middleware(fn: Middleware) {  
//         if (this.currentMethod === null) {  
//             throw new Error("You must call a method (get, post, etc.) before adding middleware.");  
//         }  
//         this.middlewares.push(fn);  
//     }  

//     private async handleMiddleware(req: http.IncomingMessage, res: http.ServerResponse, next: () => void) {  
//         let index = 0;  

//         const executeMiddleware = async () => {  
//             if (index < this.middlewares.length) {  
//                 const middleware = this.middlewares[index++];  
//                 await middleware(req, res, executeMiddleware);  
//             } else {  
//                 next();  
//             }  
//         };  

//         await executeMiddleware();  
//     }  

//     public async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {  
//         const route = this.routes[req.method as keyof HttpMethods]?.[req.url as string];  
//         if (route) {  
//             await this.handleMiddleware(req, res, async () => {  
//                 await route.controller(req, res);  
//             });  
//         } else {  
//             res.writeHead(404);  
//             res.end("Not Found");  
//         }  
//     }  

//     get(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {  
//         this.setCurrentMethod('GET');  
//         if (this.routes.GET[path]) {  
//             duplicateError(path);  
//         }  
//         this.routes.GET[path] = {  
//             controller: controller  
//         };  
//         this.resetCurrentMethod();  
//     }  

//     post(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {  
//         this.setCurrentMethod('POST');  
//         if (this.routes.POST[path]) {  
//             duplicateError(path);  
//         }  
//         this.routes.POST[path] = {  
//             controller: controller  
//         };  
//         this.resetCurrentMethod();  
//     }  

//     put(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {  
//         this.setCurrentMethod('PUT');  
//         if (this.routes.PUT[path]) {  
//             duplicateError(path);  
//         }  
//         this.routes.PUT[path] = {  
//             controller: controller  
//         };  
//         this.resetCurrentMethod();  
//     }  

//     patch(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {  
//         this.setCurrentMethod('PATCH');  
//         if (this.routes.PATCH[path]) {  
//             duplicateError(path);  
//         }  
//         this.routes.PATCH[path] = {  
//             controller: controller  
//         };  
//         this.resetCurrentMethod();  
//     }  

//     delete(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {  
//         this.setCurrentMethod('DELETE');  
//         if (this.routes.DELETE[path]) {  
//             duplicateError(path);  
//         }  
//         this.routes.DELETE[path] = {  
//             controller: controller  
//         };  
//         this.resetCurrentMethod();  
//     }  

//     options(path: string, controller: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<JsonResponse>) {  
//         this.setCurrentMethod('OPTIONS');  
//         if (this.routes.OPTIONS[path]) {  
//             duplicateError(path);  
//         }  
//         this.routes.OPTIONS[path] = {  
//             controller: controller  
//         };  
//         this.resetCurrentMethod();  
//     }  

//     exportRoutes() {  
//         return this.routes;  
//     }  
// }  

// export default AxonRouter;