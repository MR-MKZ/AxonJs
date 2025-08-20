import RouterException from './exceptions/RouterException';
import addRoutePrefix from '../core/utils/routePrefixHandler';
import {
  FuncController,
  Middleware,
  RouteParams,
  HttpMethods,
  MiddlewareStorage,
} from '../types/Router';
import { logger } from '../core/utils/coreLogger';
import { resolveConfig } from '../core/config/AxonConfig';
import { AxonValidator } from '../modules/validation';
import type { ClassController, ValidationObj } from '../types/Router';
import { BaseController } from '../modules/ClassController';
import { AxonDependencyHandler } from '../modules/DI';
import AxonConfig from '../types/Config';
import { createClassHandler } from '../modules/ClassController';

const duplicateError = (path: string, method: keyof HttpMethods) => {
  throw new RouterException({
    msg: 'Duplicated route!',
    name: 'RouterError -> DUPLICATED_ROUTE',
    meta: {
      type: 'DUPLICATED_ROUTE',
      description: `route "${method} ${path}" is duplicated`,
    },
  });
};

let MIDDLEWARE_TIMEOUT: number;
let Config: AxonConfig;

resolveConfig(false).then(config => {
  Config = config;
  MIDDLEWARE_TIMEOUT = config.MIDDLEWARE_TIMEOUT || 10000;
});

export class AxonRouteHandler<P = {}> {
  public _controller: FuncController<P> | ClassController<any, any>;
  public _middlewares: MiddlewareStorage[];

  constructor(controller: FuncController<P> | ClassController<any, any>) {
    this._controller = controller;
    this._middlewares = [];
  }

  public middleware(fn: Middleware, timeout?: number, critical: boolean = false) {
    this._middlewares.push({
      timeout: timeout || MIDDLEWARE_TIMEOUT,
      middleware: fn,
      critical,
    });

    return this;
  }
}

class AxonRouter {
  private routes: HttpMethods;
  public prefix: string | undefined;

  constructor(prefix?: string) {
    this.prefix = prefix;

    this.routes = {
      GET: {},
      POST: {},
      PUT: {},
      PATCH: {},
      DELETE: {},
      OPTIONS: {},
    };
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
   *
   * @example
   *
   * router.get("/user/{param}(regex)", (req: Request<{ param: string }>, res: Response) => {
   *  res.send("Hello World");
   * });
   *
   * router.get("/user", userController, [
   *      {
   *          schema: limitSchema,
   *          target: "query",
   *          options: {
   *              abortEarly: false
   *          }
   *      }
   * ])
   */
  public get<Path extends string, C extends BaseController, M extends keyof C>(
    path: Path,
    controller: FuncController<RouteParams<Path>> | ClassController<C, M>,
    validation?: ValidationObj[]
  ) {
    if (this.routes.GET[path]) {
      duplicateError(path, 'GET');
    }

    this.validateController(controller);

    path = this.handleRoutePrefix(path) as Path;

    const handler = new AxonRouteHandler(controller);
    const { regex, paramNames } = this.parsePath(path);

    if (validation) {
      this.registerValidationMiddlewares(validation, handler);
    }

    const { handlerDependency, handlerDependencyCache } = this.handleDependencies(controller);

    this.routes.GET[path] = {
      handler,
      paramNames,
      regex,
      handlerDependency,
      handlerDependencyCache,
    };

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
   *
   * @example
   *
   * router.post("/user/{param}(regex)", (req: Request<{ param: string }>, res: Response) => {
   *  res.send("Hello World");
   * });
   *
   * router.post("/login", authController, [
   *      {
   *          schema: loginSchema,
   *          target: "body",
   *          options: {
   *              abortEarly: false
   *          }
   *      }
   * ])
   */
  public post<Path extends string, C extends BaseController, M extends keyof C>(
    path: Path,
    controller: FuncController<RouteParams<Path>> | ClassController<C, M>,
    validation?: ValidationObj[]
  ) {
    if (this.routes.POST[path]) {
      duplicateError(path, 'POST');
    }

    this.validateController(controller);

    path = this.handleRoutePrefix(path) as Path;

    const handler = new AxonRouteHandler(controller);
    const { regex, paramNames } = this.parsePath(path);

    if (validation) {
      this.registerValidationMiddlewares(validation, handler);
    }

    const { handlerDependency, handlerDependencyCache } = this.handleDependencies(controller);

    this.routes.POST[path] = {
      handler,
      paramNames,
      regex,
      handlerDependency,
      handlerDependencyCache,
    };

    return handler;
  }

  /**
   * Endpoint with method PUT
   *
   * The PUT HTTP request method sends data to the server for replacing and changing full state.
   * @param path route path
   * @param controller route request controller
   *
   * @example
   *
   * router.put("/user/{param}(regex)", (req: Request<{ param: string }>, res: Response) => {
   *  res.send("Hello World");
   * });
   *
   * router.put("/edit", userController, [
   *      {
   *          schema: editSchema,
   *          target: "body",
   *          options: {
   *              abortEarly: false
   *          }
   *      }
   * ])
   */
  public put<Path extends string, C extends BaseController, M extends keyof C>(
    path: Path,
    controller: FuncController<RouteParams<Path>> | ClassController<C, M>,
    validation?: ValidationObj[]
  ) {
    if (this.routes.PUT[path]) {
      duplicateError(path, 'PUT');
    }

    this.validateController(controller);

    path = this.handleRoutePrefix(path) as Path;

    const handler = new AxonRouteHandler(controller);
    const { regex, paramNames } = this.parsePath(path);

    if (validation) {
      this.registerValidationMiddlewares(validation, handler);
    }

    const { handlerDependency, handlerDependencyCache } = this.handleDependencies(controller);

    this.routes.PUT[path] = {
      handler,
      paramNames,
      regex,
      handlerDependency,
      handlerDependencyCache,
    };

    return handler;
  }

  /**
   * Endpoint with method PATCH
   *
   * The PATCH HTTP request method sends data to the server for editing part of a data.
   * @param path route path
   * @param controller route request controller
   *
   * @example
   *
   * router.patch("/user/{param}(regex)", (req: Request<{ param: string }>, res: Response) => {
   *  res.send("Hello World");
   * });
   *
   * router.patch("/edit", userController, [
   *      {
   *          schema: editSchema,
   *          target: "body",
   *          options: {
   *              abortEarly: false
   *          }
   *      },
   *      {
   *          schema: userSchema,
   *          target: "params"
   *      }
   * ])
   */
  public patch<Path extends string, C extends BaseController, M extends keyof C>(
    path: Path,
    controller: FuncController<RouteParams<Path>> | ClassController<C, M>,
    validation?: ValidationObj[]
  ) {
    if (this.routes.PATCH[path]) {
      duplicateError(path, 'PATCH');
    }

    this.validateController(controller);

    path = this.handleRoutePrefix(path) as Path;

    const handler = new AxonRouteHandler(controller);
    const { regex, paramNames } = this.parsePath(path);

    if (validation) {
      this.registerValidationMiddlewares(validation, handler);
    }

    const { handlerDependency, handlerDependencyCache } = this.handleDependencies(controller);

    this.routes.PATCH[path] = {
      handler,
      paramNames,
      regex,
      handlerDependency,
      handlerDependencyCache,
    };

    return handler;
  }

  /**
   * Endpoint with method DELETE
   *
   * The DELETE HTTP request method sends data to the server for deleting a data.
   * @param path route path
   * @param controller route request controller
   * @param validation an array contains your validation objects
   *
   * @example
   *
   * router.delete("/user/{param}(regex)", (req: Request<{ param: string }>, res: Response) => {
   *  res.send("Hello World");
   * });
   *
   * router.delete("/logout", authController, [
   *      {
   *          schema: logoutSchema,
   *          target: "params",
   *          options: {
   *              abortEarly: false
   *          }
   *      }
   * ])
   */
  public delete<Path extends string, C extends BaseController, M extends keyof C>(
    path: Path,
    controller: FuncController<RouteParams<Path>> | ClassController<C, M>,
    validation?: ValidationObj[]
  ) {
    if (this.routes.DELETE[path]) {
      duplicateError(path, 'DELETE');
    }

    this.validateController(controller);

    path = this.handleRoutePrefix(path) as Path;

    const handler = new AxonRouteHandler(controller);
    const { regex, paramNames } = this.parsePath(path);

    if (validation) {
      this.registerValidationMiddlewares(validation, handler);
    }

    const { handlerDependency, handlerDependencyCache } = this.handleDependencies(controller);

    this.routes.DELETE[path] = {
      handler,
      paramNames,
      regex,
      handlerDependency,
      handlerDependencyCache,
    };

    return handler;
  }

  /**
   * Endpoint with method OPTIONS
   *
   * The HTTP OPTIONS method returns a listing of which HTTP methods are supported and allowed.
   * @param path route path
   * @param controller route request controller
   *
   * @example
   *
   * router.options("/user/{param}(regex)", (req: Request<{ param: string }>, res: Response) => {
   *  res.send("Hello World");
   * });
   */
  public options<Path extends string, C extends BaseController, M extends keyof C>(
    path: Path,
    controller: FuncController<RouteParams<Path>> | ClassController<C, M>,
    validation?: ValidationObj[]
  ) {
    if (this.routes.OPTIONS[path]) {
      duplicateError(path, 'OPTIONS');
    }

    this.validateController(controller);

    path = this.handleRoutePrefix(path) as Path;

    const handler = new AxonRouteHandler(controller);
    const { regex, paramNames } = this.parsePath(path);

    if (validation) {
      this.registerValidationMiddlewares(validation, handler);
    }

    const { handlerDependency, handlerDependencyCache } = this.handleDependencies(controller);

    this.routes.OPTIONS[path] = {
      handler,
      paramNames,
      regex,
      handlerDependency,
      handlerDependencyCache,
    };

    return handler;
  }

  public exportRoutes() {
    return this.routes;
  }

  /**
   * Manually parses the route path.
   *
   * Supports dynamic segments in two formats:
   *
   *  - {name} for a default dynamic segment (matches anything except '/')
   *  - {name}(regex) to specify a custom regex pattern
   *
   * Example routes:
   *
   *   - /api/v1/{name}(\\d+)/user/{id}(\\d+)  → req.params is { name: string; id: string }
   *   - /api/v1/{name}(\\d+)/user/{id}          → req.params is { name: string; id: string }
   *   - /api/v1/{name}/user/{id}(\\d+)           → req.params is { name: string; id: string }
   */
  private parsePath(path: string): { regex: RegExp; paramNames: string[] } {
    let regexString = '^';
    const paramNames: string[] = [];
    let i = 0;
    while (i < path.length) {
      if (path[i] === '{') {
        const endBrace = path.indexOf('}', i);
        if (endBrace === -1) {
          throw new Error('Unclosed parameter brace in route: ' + path);
        }

        const paramName = path.slice(i + 1, endBrace);
        paramNames.push(paramName);
        i = endBrace + 1;

        if (i < path.length && path[i] === '(') {
          const endParen = path.indexOf(')', i);
          if (endParen === -1) {
            throw new Error('Unclosed custom regex in route: ' + path);
          }
          const customRegex = path.slice(i + 1, endParen);
          regexString += `(${customRegex})`;
          i = endParen + 1;
        } else {
          regexString += '([^/]+)';
        }
      } else {
        const nextBrace = path.indexOf('{', i);
        const literal = nextBrace === -1 ? path.slice(i) : path.slice(i, nextBrace);
        regexString += this.escapeRegExp(literal);
        i = nextBrace === -1 ? path.length : nextBrace;
      }
    }
    regexString += '/?$'; // Make trailing slash optional
    return { regex: new RegExp(regexString), paramNames };
  }

  private escapeRegExp(text: string): string {
    return text.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1');
  }

  private handleRoutePrefix(path: string) {
    if (this.prefix) {
      path = addRoutePrefix(path, this.prefix);
    }

    if (path[0] !== '/') path = `/${path}`;

    if (path[path.length - 1] === '/') path = path.slice(0, -1);

    if (path.includes('//')) {
      logger.warn(
        `Route path "${path}" contains multiple consecutive slashes. This is not recommended and may cause issues.`
      );
    }

    return path;
  }

  private registerValidationMiddlewares(
    validations: ValidationObj[],
    handler: AxonRouteHandler<any>
  ) {
    for (const validator of validations) {
      handler.middleware(
        AxonValidator.validate(validator.schema, validator.options, validator.target),
        undefined,
        true
      );
    }
  }

  /**
   * Check controller type and if it was class controller, it must be extends from BaseController.
   * @param controller
   */
  private validateController(controller: FuncController<any> | ClassController<any, any>) {
    if (Array.isArray(controller)) {
      const [ControllerClass, method] = controller;

      if (!(ControllerClass?.prototype instanceof BaseController)) {
        throw new Error(`Controller class must extends from BaseController`, {
          cause: ControllerClass,
        });
      }
    }
  }

  /**
   * Extract dependencies of a handler
   */
  private extractDependencies(handler: Function) {
    return AxonDependencyHandler.extractDependencies(handler);
  }

  private handleDependencies(handler: FuncController<any> | ClassController<any, any>): {
    handlerDependency: string[];
    handlerDependencyCache: { [key: string]: any };
  } {
    let handlerDependency: string[] = [];
    const handlerDependencyCache: { [key: string]: any } = {};

    if (Array.isArray(handler)) {
      const [_, classHandler] = createClassHandler(handler);
      handlerDependency = this.extractDependencies(classHandler);
    } else {
      handlerDependency = this.extractDependencies(handler);
    }

    return {
      handlerDependency,
      handlerDependencyCache,
    };
  }
}

export default AxonRouter;
