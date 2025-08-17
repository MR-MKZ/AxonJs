import { ServerOptions } from 'https';
import AxonRouter from '../Router/AxonRouter';
import { HttpMethods } from './Router';

type AxonHttpsConfig = ServerOptions;

/**
 * Cors configuration for AxonCore.
 */
interface CorsOptions {
  /**
   * Configures the Access-Control-Allow-Origin CORS header.
   *
   * Possible values:
   *
   * * Boolean - set origin to true to reflect the request origin, as defined by `req.header('Origin')`, or set it to false to disable CORS.
   *
   * * String - set origin to a specific origin. For example if you set it to `"http://example.com"` only requests from "http://example.com" will be allowed.
   *
   * * RegExp - set origin to a regular expression pattern which will be used to test the request origin. If it's a match, the request origin will be reflected. For example the pattern `/example\.com$/` will reflect any request that is coming from an origin ending with "example.com".
   *
   * * Array - set origin to an array of valid origins. Each origin can be a String or a RegExp. For example `["http://example1.com", /\.example2\.com$/]` will accept any request from "http://example1.com" or from a subdomain of "example2.com".
   *
   * * Function - set origin to a function implementing some custom logic. The function takes the request origin as the first parameter and a callback (which expects the signature err [object], allow [bool]) as the second.
   */
  origin?: boolean | string | RegExp | (string | RegExp)[];
  /**
   * Configures the Access-Control-Allow-Methods CORS header.
   *
   * Possible values:
   *
   * * String - exprects a comma-delimited `'GET,POST,DELETE'`
   *
   * * Array - `['GET', 'POST', 'DELETE']`
   */
  methods?: string | string[];
  /**
   * Configures the Access-Control-Allow-Headers CORS header.
   *
   * Possible values:
   *
   * * String - exprects a comma-delimited `'Content-Type,Authorization'`
   *
   * * Array - `['Content-Type', 'Authorization']`
   *
   * If not specified, defaults to reflecting the headers specified in the request's Access-Control-Request-Headers header.
   */
  allowedHeaders?: string | string[];
  /**
   * Configures the Access-Control-Expose-Headers CORS header.
   *
   * Possible values:
   *
   * * String - exprects a comma-delimited `'Content-Range,X-Content-Range'`
   *
   * * Array - `['Content-Range', 'X-Content-Range']`
   *
   * If not specified, no custom headers are exposed.
   */
  exposedHeaders?: string | string[];
  /**
   * Configures the Access-Control-Allow-Credentials CORS header.
   *
   * Set to `true` to pass the header, otherwise it is omitted.
   */
  credentials?: boolean;
  /**
   * Configures the Access-Control-Max-Age CORS header.
   *
   * Set to an `integer` to pass the header, otherwise it is omitted.
   */
  maxAge?: number;
  /**
   * Pass the CORS preflight response to the next handler.
   */
  preflightContinue?: boolean;
  /**
   * Provides a status code to use for successful `OPTIONS` requests, since some legacy browsers (IE11, various SmartTVs) choke on `204`.
   */
  optionsSuccessStatus?: number;
  /**
     * Alias for `allowedHeaders`.
     */
  headers?: string | string[];
}

/**
 * Configuration for AxonCore custom response messages.
 */
interface AxonResponseMessage {
  /**
   * response error message for 404 not found response from core
   *
   * use `{path}` to show request method.
   */
  notFound?: string;
  /**
   * response error message for 500 internal server error response from core
   */
  serverError?: string;
  /**
   * response error message for 405 method not allowed response from core
   *
   * use `{method}` to show request method.
   *
   * example:
   * - config: 'Method {method} is not allowed'
   * - response: 'Method TRACE is not allowed'
   */
  methodNotAllowed?: string;
  [key: string]: string | undefined;
}

/**
 * Type of input object of unloadRoute method.
 */
interface UnloadRouteParams {
  /**
   * [Optional]
   *
   * Instance of router which you want to remove it's routes from backend core.
   */
  router?: AxonRouter;

  /**
   * [Optional]
   *
   * Name of http method which you want to remove it's children routes from backend core.
   *
   * - GET
   * - POST
   * - PUT
   * - PATCH
   * - DELETE
   * - OPTIONS
   */
  method?: keyof HttpMethods;

  /**
   * A specific route which you want to remove it from backend core.
   */
  route?: string;
}

export { AxonResponseMessage, CorsOptions, AxonHttpsConfig, UnloadRouteParams };
