import * as http from 'http';
import * as https from 'https';
import { colors } from '@spacingbat3/kolor';
import { performance } from 'perf_hooks';

// Utils
import { logger } from './utils/coreLogger';
import getRequestBody from './utils/getRequestBody';
import { createClassHandler } from '../modules/ClassController';

// Types
import type { FuncController, Request, Response, Middleware, HttpMethods } from '../types/Router';
import type { AxonPlugin } from '../types/Plugin';
import type { JsonResponse } from '../types/Global';
import type { AxonConfig } from '../types/Config';
import type { UnloadRouteParams } from '../types/Core';
import type { ClassController, MiddlewareStorage } from '../types/Router';
import type { Lifecycle } from '../types/Dependency';

// Exceptions
import { routeDuplicateException } from './exceptions/CoreExceptions';

// Instances
import Router from '../Router/AxonRouter';

// Features
import AxonResponse from './response';
import { corsMiddleware } from '../modules/Cors';
import { PluginLoader } from './plugin';
import { resolveConfig } from './config/AxonConfig';
import { unloadRouteService, unloadRoutesService } from './services/unloadRoutes.service';
import { AxonDependencyHandler, NeuronContainer } from '../modules/DI';
import { getVersion } from './utils/updateChecker';

// Default values
const defaultResponses = {
  notFound: 'Not found',
  serverError: 'Internal server error',
  methodNotAllowed: 'Method {method} not allowed',
};

export default class AxonCore {
  private servers: {
    http: http.Server | null;
    https: https.Server | null;
  };

  /**
   * The routes object that contains all the routes for the server.
   */
  private routes: HttpMethods;

  /**
   * The global middlewares that will be applied to all the routes.
   */
  private globalMiddlewares: MiddlewareStorage[];

  /**
   * The config object that contains all the config for the server.
   */
  private config: AxonConfig;

  /**
   * Whether the configs are loaded or not.
   */
  private configsLoaded: boolean;

  /**
   * Whether the routes are passed or not.
   */
  private passRoutes: boolean;

  /**
   * Whether the routes are loaded or not.
   */
  private routesLoaded: boolean;

  /**
   * The regex for the query params.
   */
  private queryParamsRegex: RegExp;

  /**
   * The plugin loader instance.
   */
  private pluginLoader: PluginLoader = new PluginLoader();

  /**
   * The dependency handler of Axon core.
   */
  private dependencyHandler: AxonDependencyHandler = new AxonDependencyHandler();

  constructor(config?: AxonConfig) {
    this.servers = {
      http: null,
      https: null,
    };

    this.routes = {
      GET: {},
      POST: {},
      PUT: {},
      PATCH: {},
      DELETE: {},
      OPTIONS: {},
    };

    this.globalMiddlewares = [];

    this.config = config || {};
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

  private async initializePlugins() {
    const startTime = performance.now();

    await this.pluginLoader.initializePlugins(this);

    const endTime = performance.now();

    logger.debug(`Plugins loaded in ${(endTime - startTime).toFixed(2)}ms`);
  }

  /**
   * A method to load core configs
   *
   */
  private async loadConfig() {
    const startTime = performance.now();

    this.config = await resolveConfig(true, this.config);

    this.configsLoaded = true;

    const endTime = performance.now();

    logger.debug(`Core config loaded in ${(endTime - startTime).toFixed(2)}ms`);
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
    const startTime = performance.now();

    this.passRoutes = false;

    const routerRoutes: HttpMethods = router.exportRoutes();

    (Object.keys(routerRoutes) as Array<keyof HttpMethods>).forEach(method => {
      if (Object.keys(routerRoutes[method]).length > 0) {
        Object.keys(routerRoutes[method]).forEach(route => {
          if (!this.routes[method][route]) {
            this.routes[method][route] = routerRoutes[method][route];
            this.routes['OPTIONS'][route] = routerRoutes[method][route];

            logger.debug(`loaded route ${method} ${route}`);
          } else {
            routeDuplicateException(method, route);
          }
        });
      }
    });

    this.routesLoaded = true;

    const endTime = performance.now();

    logger.debug(`Routes loaded in ${(endTime - startTime).toFixed(2)}ms`);
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
    await unloadRoutesService(this.routes);
  }

  /**
   * Register a static value or instance (object, function, class instance).
   *
   * Default lifecycle of dependencies is **singleton**
   * @param name String, array of string or Function key for the dependency
   * @param value Function, object or instance to register as dependency value
   * @param options Some options for configuring the dependency
   *
   * @since 0.13.0
   *
   * @example
   * core.registerDependencyValue('logger', new Logger());
   * core.registerDependencyValue('config', { port: 3000 });
   */
  registerDependencyValue<T>(
    name: string | string[],
    value: T,
    options?: { lifecycle?: Lifecycle }
  ) {
    this.dependencyHandler.register(name, value, { ...options, isFactory: false });
  }

  /**
   * Register a factory function that creates the dependency (sync or async).
   *
   * Default lifecycle of dependencies is **singleton**
   * @param name String, array of string or Function key for the dependency
   * @param factory Factory function or something that must run to return the instance of dependency
   * @param options Some options for configuring the dependency
   *
   * @since 0.13.0
   *
   * @example
   * core.registerDependencyFactory('db', () => new DB())
   * core.registerDependencyFactory('auth', async () => await AuthService.build())
   */
  registerDependencyFactory<T>(
    name: string | string[],
    factory: () => T | Promise<T>,
    options?: { lifecycle?: Lifecycle }
  ) {
    this.dependencyHandler.register(name, factory, { ...options, isFactory: true });
  }

  /**
   * You can set one or many middlewares in global scope with this method.
   * @param fn middleware function or array of middleware functions
   * @param timeout timeout in milliseconds
   * @param critical whether the middleware is critical (defaults to false)
   * @example
   * core.globalMiddleware(authMiddleware, 5000, true) // critical middleware with 5s timeout
   * core.globalMiddleware([uploadMiddleware, userMiddleware], 10000, false) // optional middlewares with 10s timeout
   */
  async globalMiddleware(
    fn: Middleware | Middleware[],
    timeout?: number,
    critical: boolean = false
  ) {
    const startTime = performance.now();

    timeout = timeout || this.config.MIDDLEWARE_TIMEOUT || 10000;

    if (typeof fn === 'function') {
      this.globalMiddlewares.push({
        timeout: timeout,
        middleware: fn,
        critical,
      });
    }

    if (typeof fn === 'object') {
      for (const middleware of fn) {
        if (typeof middleware === 'function') {
          this.globalMiddlewares.push({
            timeout: timeout,
            middleware: middleware,
            critical,
          });
        }
      }
    }

    logger.debug('global middlewares loaded');

    const endTime = performance.now();

    logger.debug(`Global middlewares loaded in ${(endTime - startTime).toFixed(2)}ms`);
  }

  /**
   * Clears all the global middlewares
   */
  clearGlobalMiddlewares() {
    this.globalMiddlewares = [];
  }

  /**
   * Http request main handler
   * @param req incoming request
   * @param res server response
   * @returns
   */
  async #handleRequest(req: Request<any>, res: Response) {
    res.status = (code: number) => {
      res.statusCode = code;

      return new AxonResponse(res);
    };

    if (!Object.keys(this.routes).includes(req.method as keyof HttpMethods)) {
      return this.response(req, res, {
        body: {
          message:
            this.config.RESPONSE_MESSAGES?.methodNotAllowed?.replace(
              '{method}',
              req.method as string
            ) || defaultResponses.methodNotAllowed?.replace('{method}', req.method as string),
        },
        responseCode: 405,
      });
    }

    const method = req.method as keyof HttpMethods;

    let foundRoute = false;

    if (Object.keys(this.routes[method]).length === 0) {
      return this.response(req, res, {
        body: {
          message:
            this.config.RESPONSE_MESSAGES?.notFound?.replace('{path}', req.url as string) ||
            defaultResponses.notFound?.replace('{path}', req.url as string),
        },
        responseCode: 404,
      });
    }

    for (const path of Object.keys(this.routes[method])) {
      const index = Object.keys(this.routes[method]).indexOf(path);

      // convert request url from string | undefined to string
      const pathname = req.url as string;

      // Strip query parameters from pathname before matching
      const pathnameWithoutQuery = pathname.split('?')[0];

      const match = this.routes[method][path]['regex'].exec(pathnameWithoutQuery);

      if (match) {
        try {
          if (!foundRoute) {
            foundRoute = true;

            const route = this.routes[method][path];

            const params: Record<string, string | undefined> = {};
            const queryParams: Record<string, string | undefined> = {};

            route['paramNames'].forEach((key: string, index: number) => {
              params[key] = match[index + 1];
            });

            let queryParamsMatch: RegExpExecArray | null;

            while ((queryParamsMatch = this.queryParamsRegex.exec(pathname)) !== null) {
              const [_, key, value] = queryParamsMatch;
              queryParams[decodeURIComponent(key)] = decodeURIComponent(value);
            }

            req.params = params;
            req.query = queryParams;

            const middlewares: MiddlewareStorage[] = route['handler']['_middlewares'];

            const controllerInstance: FuncController | ClassController<any, any> =
              route['handler']['_controller'];

            let controller: FuncController;
            let manualArgs: string[];
            let dependencies: { [key: string]: any };

            if (Array.isArray(controllerInstance)) {
              // --- Logic for ClassController [Controller, 'method'] ---
              // In this block, TypeScript knows controllerInstance is an array.
              // This is where you use the factory function we built.

              // The 'controllerInstance' is exactly what createClassHandler was designed for!
              const [handler, _] = createClassHandler(controllerInstance);
              controller = handler;
            } else if (typeof controllerInstance === 'function') {
              // --- Logic for FuncController ---
              // If it's not an array, we check if it's a function.
              // In this block, TypeScript knows it's a function.

              controller = controllerInstance;
            } else {
              // --- Error Case ---
              // The definition is neither a valid array nor a function.
              throw new Error(
                "Invalid handler definition. Expected an array [Controller, 'method'] or a function."
              );
            }

            // check, resolve, resolve from cache and cache dependencies.
            if (route['handlerDependency'].length > 0) {
              if (Object.entries(route['handlerDependencyCache']).length !== 0) {
                // pass dependencies from cache because cache is exist.
                dependencies = route['handlerDependencyCache'];
              } else {
                // cache doesn't exist and dependencies will resolve from storage
                dependencies = await this.dependencyHandler.resolve(route['handlerDependency']);

                if (this.config.DEPENDENCY_CACHE) {
                  // cache dependencies if dependency cache activated
                  route['handlerDependencyCache'] = dependencies;
                }
              }
            }

            const axonCors = corsMiddleware(this.config.CORS);

            const AxonCorsMiddleware: MiddlewareStorage = {
              timeout: this.config.MIDDLEWARE_TIMEOUT || 10000,
              middleware: axonCors,
            };

            // Handle CORS first, then global middlewares, then route-specific middlewares, and finally the controller
            await this.handleMiddleware(
              req,
              res,
              async () => {
                await this.handleMiddleware(
                  req,
                  res,
                  async () => {
                    await this.handleMiddleware(
                      req,
                      res,
                      async () => {
                        await controller(req, res, dependencies);
                      },
                      middlewares
                    );
                  },
                  this.globalMiddlewares
                );
              },
              [AxonCorsMiddleware]
            );

            // log incoming requests
            if (this.config.LOGGER_VERBOSE) {
              logger.request(
                {
                  ip: req.socket.remoteAddress,
                  url: req.url,
                  method: req.method,
                  headers: req.headers,
                  body: req.body,
                  code: res.statusCode,
                },
                'new http request'
              );
            } else {
              logger.request(
                `${req.socket.remoteAddress} - ${req.method} ${req.url} ${res.statusCode} - ${req.headers['user-agent']}`
              );
            }
          } else {
            continue;
          }
        } catch (error) {
          logger.error(error);

          this.response(req, res, {
            body: {
              message: this.config.RESPONSE_MESSAGES?.serverError || defaultResponses.serverError,
            },
            responseCode: 500,
          });
        }
      }

      if (!foundRoute && Object.keys(this.routes[method]).length == index + 1) {
        this.response(req, res, {
          body: {
            message:
              this.config.RESPONSE_MESSAGES?.notFound?.replace('{path}', req.url as string) ||
              defaultResponses.notFound?.replace('{path}', req.url as string),
          },
          responseCode: 404,
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
    middlewares: MiddlewareStorage[]
  ) {
    for (const { middleware, timeout, critical } of middlewares) {
      if (res.headersSent) return;

      const ms = timeout;
      let nextCalled = false;

      try {
        // Execute middleware with optional timeout
        await new Promise<void>((resolve, reject) => {
          let timer: NodeJS.Timeout | undefined;
          if (ms > 0) {
            timer = setTimeout(() => {
              reject(new Error(`Middleware timeout exceeded after ${ms}ms`));
            }, ms);
          }

          // Wrap next() to signal completion and clear timer
          const wrappedNext = () => {
            nextCalled = true;
            if (timer) clearTimeout(timer);
            resolve();
          };

          // Call the middleware
          Promise.resolve(middleware(req, res, wrappedNext))
            .then(() => {
              if (!nextCalled && res.headersSent) {
                if (timer) clearTimeout(timer);
                resolve();
              }
            })
            .catch(err => {
              if (timer) clearTimeout(timer);
              reject(err);
            });
        });
      } catch (err) {
        if (res.headersSent) return;

        const errMsg = err instanceof Error ? err.message : String(err);
        if (critical) {
          logger.error(
            {
              message: this.config.RESPONSE_MESSAGES?.serverError ?? defaultResponses.serverError,
              error: errMsg,
              critical: true,
            },
            'Critical middleware failure'
          );

          return this.response(req, res, {
            body: {
              message: this.config.RESPONSE_MESSAGES?.serverError ?? defaultResponses.serverError,
              error: errMsg,
              critical: true,
            },
            responseCode: 500,
          });
        } else {
          logger.warn(`Non-critical middleware error or timeout: ${errMsg}`);
          continue;
        }
      }

      if (nextCalled) continue;
    }

    if (!res.headersSent) {
      await next();
    }
  }

  private response(req: Request<any>, res: Response, data: JsonResponse) {
    if (data.responseMessage) {
      res.statusMessage = data.responseMessage;
    }

    if (typeof data.body !== 'object') {
      throw new TypeError(`Response body can't be ${typeof data.body}`);
    }

    res.statusCode = data.responseCode;

    if (data.headers) {
      for (const key in data.headers) {
        if (data.headers[key]) {
          res.setHeader(key, data.headers[key]);
        }
      }
    }

    // log incoming requests
    if (this.config.LOGGER_VERBOSE) {
      logger.request(
        {
          ip: req.socket.remoteAddress,
          url: req.url,
          method: req.method,
          headers: req.headers,
          body: req.body,
          code: res.statusCode,
        },
        'New http request'
      );
    } else {
      logger.request(
        `${req.socket.remoteAddress} - ${req.method} ${req.url} ${res.statusCode} - ${req.headers['user-agent']}`
      );
    }

    return res.status(data.responseCode).body(data.body);
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
  listen(
    host: string = '127.0.0.1',
    port: number | { https: number; http: number } = 8000,
    callback?: (mode?: string) => void
  ) {
    // Wait until some necessary items are loaded before starting the server
    const corePreloader = async (): Promise<void> => {
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (this.routesLoaded && this.configsLoaded) {
            logger.info('All plugins and routes loaded');
            clearInterval(interval);
            resolve();
          } else if (this.passRoutes) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    };

    // load core dependencies

    // load config
    this.loadConfig()
      .then(() => {
        // initialize plugins
        this.initializePlugins()
          .then(() => {
            // preloader
            corePreloader()
              .then(() => {
                // start server
                this.startServer(host, port, callback);
              })
              .catch(error => {
                logger.error(error, 'Unexpected core error, Code: 1001');
                process.exit(-1);
              });
          })
          .catch(error => {
            logger.error(error, 'Unexpected core error, Code: 1002');
            process.exit(-1);
          });
      })
      .catch(error => {
        logger.error(error, 'Unexpected core error, Code: 1003');
        process.exit(-1);
      });
  }

  /**
   * Starts the webservers
   * @param host server host address
   * @param port server port
   * @param callback callback a function to run after starting to listen
   */
  private startServer(
    host: string,
    port: number | { https: number; http: number },
    callback?: (mode?: string) => void
  ) {
    // http request handler
    const httpHandler = async (req: http.IncomingMessage, res: http.ServerResponse) => {
      try {
        await getRequestBody(req as Request<any>);

        this.#handleRequest(req as Request<any>, res as Response);
      } catch (error) {
        logger.error(error, 'Unexpected core error');
      }
    };

    // port handler
    const portHandler = (mode: string) => {
      switch (mode) {
        case 'http':
          if (typeof port === 'object') {
            return port.http;
          } else {
            return port;
          }
        case 'https':
          if (typeof port === 'object') {
            return port.https;
          } else {
            return 8443;
          }
        default:
          return 8000;
      }
    };

    const isHttpsActive = () => Object.keys(this.config.HTTPS || {}).length > 0;

    // initialize https and http server
    if (isHttpsActive()) {
      this.servers.https = https.createServer(this.config.HTTPS || {}, httpHandler);
    }

    this.servers.http = http.createServer(httpHandler);

    // handle callback function
    if (!callback) {
      callback = (mode?: string) => {
        if (mode === 'https') {
          if (isHttpsActive()) {
            logger.core(
              colors.whiteBright(`Server started on https://${host}:${portHandler('https')}`)
            );
          }
        } else if (mode === 'http') {
          logger.core(
            colors.whiteBright(`Server started on http://${host}:${portHandler('http')}`)
          );
        }
      };
    }

    // running web servers
    this.servers.https?.listen(portHandler('https'), host, () => callback('https'));
    this.servers.http?.listen(portHandler('http'), host, () => callback('http'));

    this.servers.https?.on('error', e => {
      logger.error(e, `Starting server failed`);
      process.exit(-1);
    });

    this.servers.http?.on('error', e => {
      logger.error(e, `Starting server failed`);
      process.exit(-1);
    });
  }

  /**
   * Closes the web servers
   * @param {string} [server] server to close
   * @example
   * core.close() // closes both http and https servers
   * core.close("http") // closes only http server
   * core.close("https") // closes only https server
   */
  close(server?: 'http' | 'https') {
    if (!server) {
      if (this.servers.http) {
        this.servers.http.close();
        logger.core('Http server closed');
      }

      if (this.servers.https) {
        this.servers.https.close();
        logger.core('Https server closed');
      }

      return true;
    }

    if (this.servers[server]) {
      this.servers[server].close();
      logger.core(`${server} server closed`);
      return true;
    }

    return false;
  }

  /**
   * Returns the server object
   * @returns {Object} server object
   * @example
   * const servers = core.getServers();
   * servers.http.on("request", () => {
   *     // something here
   * });
   */
  getServers(): {
    http: http.Server | null;
    https: https.Server | null;
  } {
    return this.servers;
  }

  /**
   * Returns the core config
   * @returns {AxonConfig} core config
   * @example
   * const config = core.getConfig();
   * console.log(config);
   */
  getConfig(): AxonConfig {
    return this.config;
  }

  /**
   * Get instance of dependency container that is using by Axon core.
   * @returns {NeuronContainer} Dependency Container
   * @since 0.13.0
   */
  getContainer(): NeuronContainer {
    return this.dependencyHandler.getContainer();
  }
}
