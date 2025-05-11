// Libraries
import * as http from "http";

// Instances
import AxonCore from "@/core/AxonCore";
import AxonRouter from "@/Router/AxonRouter";
import { logger } from "@/core/utils/coreLogger";

// Types
import type { RouterExceptionError } from "@/types/GlobalTypes";
import type { 
  AxonResponseMessage, 
  AxonCorsConfig, 
  AxonHttpsConfig, 
  UnloadRouteParams 
} from "@/types/CoreTypes";
import type {
  Request,
  Response,
  Middleware,
  NextFunc,
  FuncController,
  HttpMethods,
  ValidationObj
} from "@/types/RouterTypes";
import type { AxonConfig } from "@/types/ConfigTypes";
import type { AxonPlugin, PluginMode } from "@/types/PluginTypes";
import type {
  ValidationConfig,
  ValidationSchema,
  ValidationTargets
} from "@/types/ValidatorTypes";

/**
 * Instance of AxonRouter for easier usage
 * @param prefix prefix for all routes in this router
 * @returns {AxonRouter} returns an instance of AxonRouter
 * @example
 * const router = Router(); // without prefix
 * const router2 = Router("/api/v1"); // with prefix
 */
const Router = (prefix?: string): AxonRouter => new AxonRouter(prefix);

/**
 * Instance of AxonCore for easier usage
 * @returns {AxonCore} returns an instance of AxonCore
 */
const Axon = (): AxonCore => new AxonCore();

/**
 * Pino logger instance used in Axon core and exposed for external use.
 */
const axonLogger = logger;

// interface Headers extends http.OutgoingHttpHeaders { }
type Headers = http.OutgoingHttpHeaders;

export {
  // Cores - Router and Main core
  AxonCore,
  AxonRouter,

  // Core instance generators
  Axon,
  Router,

  // Core config
  AxonConfig,

  // Configs - configuration feature
  AxonResponseMessage,
  AxonCorsConfig,
  AxonHttpsConfig,

  // Main core
  UnloadRouteParams,
  
  // Router
  HttpMethods,
  ValidationObj,

  // Request life cycle
  Request,
  Response,
  Headers,
  NextFunc,

  // Plugin
  AxonPlugin,
  PluginMode,

  // Handlers
  FuncController,
  Middleware,

  // Errors
  RouterExceptionError,

  // Pino logger - Logger feature
  axonLogger,

  // Axon Validator - Validation feature
  ValidationConfig,
  ValidationSchema,
  ValidationTargets
}