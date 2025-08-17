/**
 * @file A zero-dependency, type-safe CORS middleware for Axon framework.
 * @author Mr.MKZ
 * @version 1.0.0
 */

import { logger } from '../../core/utils/coreLogger';
import type { Request, Response, NextFunc } from '../../types/RouterTypes';
import type { CorsOptions } from "../../types/CoreTypes";


// --- Type Definitions for CORS ---

/**
 * A function that dynamically resolves CORS options for a given request.
 * @param req The incoming request.
 * @param callback A function to call with an error or the resolved CORS options.
 */
export type CorsOptionsDelegate = (
  req: Request<any>,
  callback: (err: Error | null, options?: CorsOptions) => void
) => void;

/**
 * Represents a single HTTP header as a key-value pair.
 * The value can be `false` to indicate the header should not be set.
 */
type Header = [string, string | false];

/**
 * Represents a list of headers to be applied to a response.
 * Can contain single headers, nested arrays of headers, or null values.
 */
type HeadersList = (Header | Header[] | null)[];


// --- Refactored CORS Middleware ---

/**
 * Default options for the CORS middleware.
 */
const defaultOptions: CorsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Type guard to check if a value is a string.
 * @param s The value to check.
 * @returns `true` if the value is a string, otherwise `false`.
 */
const isString = (s: any): s is string => {
  return typeof s === 'string' || s instanceof String;
};

/**
 * Determines if a request's origin is allowed by the configured options.
 * @param origin The request origin string from the `Origin` header.
 * @param allowedOrigin The `origin` option from the CORS configuration.
 * @returns `true` if the origin is allowed, otherwise `false`.
 */
const isOriginAllowed = (origin: string, allowedOrigin: CorsOptions['origin']): boolean => {
  if (Array.isArray(allowedOrigin)) {
    for (const value of allowedOrigin) {
      if (isOriginAllowed(origin, value)) {
        return true;
      }
    }
    return false;
  } else if (isString(allowedOrigin)) {
    return origin === allowedOrigin;
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  } else {
    return !!allowedOrigin;
  }
};

/**
 * Appends a value to the `Vary` response header, avoiding duplicates.
 * This is a zero-dependency replacement for the 'vary' library.
 * @param res The response object.
 * @param field The header field (e.g., 'Origin') to add to the `Vary` header.
 */
const appendToVaryHeader = (res: Response, field: string) => {
  let existingVary = res.getHeader('Vary') || '';
  if (typeof existingVary !== 'string') {
    existingVary = String(existingVary);
  }

  const existingFields = existingVary.toLowerCase().split(/,\s*/);
  if (existingFields.includes(field.toLowerCase())) {
    return;
  }

  const newVary = existingVary ? `${existingVary}, ${field}` : field;
  res.setHeader('Vary', newVary);
};


// --- Header Configuration Functions ---

/**
 * Generates headers related to the `Access-Control-Allow-Origin` and `Vary` policies.
 * @param options The CORS configuration.
 * @param req The incoming request.
 * @returns An array of headers to be applied.
 */
const configureOrigin = (options: CorsOptions, req: Request<any>): Header[] => {
  const requestOrigin = req.headers.origin as string;
  const headers: Header[] = [];

  if (!options.origin || options.origin === '*') {
    headers.push(['Access-Control-Allow-Origin', '*']);
  } else if (isString(options.origin)) {
    headers.push(['Access-Control-Allow-Origin', options.origin]);
    headers.push(['Vary', 'Origin']);
  } else {
    const isAllowed = isOriginAllowed(requestOrigin, options.origin);
    headers.push(['Access-Control-Allow-Origin', isAllowed ? requestOrigin : false]);
    headers.push(['Vary', 'Origin']);
  }

  return headers;
};

/**
 * Generates the `Access-Control-Allow-Methods` header.
 * @param options The CORS configuration.
 * @returns The configured header.
 */
const configureMethods = (options: CorsOptions): Header => {
  const methods = Array.isArray(options.methods) ? options.methods.join(',') : options.methods!;
  return ['Access-Control-Allow-Methods', methods];
};

/**
 * Generates the `Access-Control-Allow-Credentials` header.
 * @param options The CORS configuration.
 * @returns The configured header, or `null` if not enabled.
 */
const configureCredentials = (options: CorsOptions): Header | null => {
  if (options.credentials === true) {
    return ['Access-Control-Allow-Credentials', 'true'];
  }
  return null;
};

/**
 * Generates headers related to the `Access-Control-Allow-Headers` policy.
 * @param options The CORS configuration.
 * @param req The incoming request.
 * @returns An array of headers to be applied.
 */
const configureAllowedHeaders = (options: CorsOptions, req: Request<any>): Header[] => {
  let allowedHeaders = options.allowedHeaders || options.headers;
  const headers: Header[] = [];

  if (!allowedHeaders) {
    allowedHeaders = req.headers['access-control-request-headers'] as string;
    if (allowedHeaders) {
      headers.push(['Vary', 'Access-Control-Request-Headers']);
    }
  }

  if (Array.isArray(allowedHeaders)) {
    allowedHeaders = allowedHeaders.join(',');
  }

  if (allowedHeaders) {
    headers.push(['Access-Control-Allow-Headers', allowedHeaders]);
  }

  return headers;
};

/**
 * Generates the `Access-Control-Expose-Headers` header.
 * @param options The CORS configuration.
 * @returns The configured header, or `null` if not specified.
 */
const configureExposedHeaders = (options: CorsOptions): Header | null => {
  let headers = options.exposedHeaders;
  if (!headers) return null;

  if (Array.isArray(headers)) {
    headers = headers.join(',');
  }
  if (headers) {
    return ['Access-Control-Expose-Headers', headers];
  }
  return null;
};

/**
 * Generates the `Access-Control-Max-Age` header.
 * @param options The CORS configuration.
 * @returns The configured header, or `null` if not specified.
 */
const configureMaxAge = (options: CorsOptions): Header | null => {
  const maxAge = options.maxAge?.toString();
  if (maxAge) {
    return ['Access-Control-Max-Age', maxAge];
  }
  return null;
};

/**
 * Applies a list of headers to the response object.
 * @param headers A list of headers to apply.
 * @param res The response object.
 */
const applyHeaders = (headers: HeadersList, res: Response) => {
  for (const header of headers) {
    // Skips null/undefined entries
    if (!header) continue;

    // FIX: Explicitly check for and skip empty arrays.
    // This prevents destructuring `[]` into `[undefined, undefined]`.
    if (Array.isArray(header) && header.length === 0) {
      continue;
    }

    // Check if it's a nested array of headers (which itself is not empty)
    if (Array.isArray(header[0])) {
      applyHeaders(header as HeadersList, res);
      continue;
    }

    const [key, value] = header as Header;

    // Final safeguard: only set header if key is a valid string and value is not false
    if (typeof key === 'string' && value !== false) {
      if (key === 'Vary') {
        appendToVaryHeader(res, value as string);
      } else {
        res.setHeader(key, value as string);
      }
    }
  }
};


/**
 * The core CORS handling logic that distinguishes between preflight and actual requests.
 * @param options The resolved CORS options for the current request.
 * @param req The incoming request.
 * @param res The outgoing response.
 * @param next The next middleware function.
 */
const cors = async (options: CorsOptions, req: Request<any>, res: Response, next: NextFunc) => {
  const method = req.method?.toUpperCase();

  if (method === 'OPTIONS') {
    // This is a preflight request.
    const headers: HeadersList = [
      configureOrigin(options, req),
      configureCredentials(options),
      configureMethods(options),
      configureAllowedHeaders(options, req),
      configureMaxAge(options),
      configureExposedHeaders(options)
    ];
    applyHeaders(headers, res);

    if (options.preflightContinue) {
      await next();
    } else {
      res.statusCode = options.optionsSuccessStatus as number;
      res.setHeader('Content-Length', '0');
      res.end();
    }
  } else {
    // This is an actual request.
    const headers: HeadersList = [
      configureOrigin(options, req),
      configureCredentials(options),
      configureExposedHeaders(options)
    ];
    applyHeaders(headers, res);
    await next();
  }
};

/**
 * Creates and returns the CORS middleware function.
 * @param options A static `CorsOptions` object or a `CorsOptionsDelegate` function
 * for dynamically resolving options.
 * @returns An async middleware function compatible with frameworks like Express.
 */
export const corsMiddleware = (options?: CorsOptions | CorsOptionsDelegate) => {
  const optionsCallback: CorsOptionsDelegate = typeof options === 'function'
    ? options
    : (req, cb) => cb(null, options);

  return async (req: Request<any>, res: Response, next: NextFunc) => {
    optionsCallback(req, async (err, corsOptions) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).body({ error: err.message });
        }
        return;
      }

      const finalOptions = { ...defaultOptions, ...corsOptions };

      try {
        await cors(finalOptions, req, res, next);
      } catch (e: any) {
        logger.error(e, "Error in CORS middleware");
        if (!res.headersSent) {
          res.status(500).body({ error: 'Internal Server Error in CORS' });
        } else {
          res.end();
        }
      }
    });
  };
};
