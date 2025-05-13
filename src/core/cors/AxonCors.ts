import assign from "object-assign";
// import { nextFn, Request, Response } from "../..";
import { NextFunc, Request, Response } from "../../types/RouterTypes";
import vary from "vary";

const defaults = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
}

const isString = (s: any) => {
    return typeof s === 'string' || s instanceof String;
}

const isOriginAllowed = async (origin: any, allowedOrigin: any) => {
    if (Array.isArray(allowedOrigin)) {
        for (let i = 0; i < allowedOrigin.length; ++i) {
            if (await isOriginAllowed(origin, allowedOrigin[i])) {
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
}

const configureOrigin = async (options: any, req: Request<any>) => {
    let requestOrigin = req.headers.origin,
        headers = [],
        isAllowed;

    if (!options.origin || options.origin === '*') {
        // allow any origin
        headers.push([{
            key: 'Access-Control-Allow-Origin',
            value: '*'
        }]);
    } else if (isString(options.origin)) {
        // fixed origin
        headers.push([{
            key: 'Access-Control-Allow-Origin',
            value: options.origin
        }]);
        headers.push([{
            key: 'Vary',
            value: 'Origin'
        }]);
    } else {
        isAllowed = await isOriginAllowed(requestOrigin, options.origin);
        // reflect origin
        headers.push([{
            key: 'Access-Control-Allow-Origin',
            value: isAllowed ? requestOrigin : false
        }]);
        headers.push([{
            key: 'Vary',
            value: 'Origin'
        }]);
    }

    return headers;
}

const configureMethods = async (options: any) => {
    let methods = options.methods;
    if (methods.join) {
        methods = options.methods.join(','); // .methods is an array, so turn it into a string
    }
    return {
        key: 'Access-Control-Allow-Methods',
        value: methods
    };
}

const configureCredentials = async (options: any) => {
    if (options.credentials === true) {
        return {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
        };
    }
    return null;
}

const configureAllowedHeaders = async (options: any, req: Request<any>) => {
    let allowedHeaders = options.allowedHeaders || options.headers;
    const headers = [];

    if (!allowedHeaders) {
        allowedHeaders = req.headers['access-control-request-headers']; // .headers wasn't specified, so reflect the request headers
        headers.push([{
            key: 'Vary',
            value: 'Access-Control-Request-Headers'
        }]);
    } else if (allowedHeaders.join) {
        allowedHeaders = allowedHeaders.join(','); // .headers is an array, so turn it into a string
    }
    if (allowedHeaders && allowedHeaders.length) {
        headers.push([{
            key: 'Access-Control-Allow-Headers',
            value: allowedHeaders
        }]);
    }

    return headers;
}

const configureExposedHeaders = async (options: any) => {
    let headers = options.exposedHeaders;
    if (!headers) {
        return null;
    } else if (headers.join) {
        headers = headers.join(','); // .headers is an array, so turn it into a string
    }
    if (headers && headers.length) {
        return {
            key: 'Access-Control-Expose-Headers',
            value: headers
        };
    }
    return null;
}

const configureMaxAge = async (options: any) => {
    const maxAge = (typeof options.maxAge === 'number' || options.maxAge) && options.maxAge.toString()
    if (maxAge && maxAge.length) {
        return {
            key: 'Access-Control-Max-Age',
            value: maxAge
        };
    }
    return null;
}

const applyHeaders = async (headers: any, res: Response) => {
    for (let i = 0, n = headers.length; i < n; i++) {
        const header = headers[i];
        if (header) {
            if (Array.isArray(header)) {
                applyHeaders(header, res);
            } else if (header.key === 'Vary' && header.value) {
                vary(res, header.value);
            } else if (header.value) {
                res.setHeader(header.key, header.value);
            }
        }
    }
}

const cors = async (options: any, req: Request<any>, res: Response, next: NextFunc) => {
    const headers = [],
        method = req.method && req.method.toUpperCase && req.method.toUpperCase();

    if (method === 'OPTIONS') {
        // preflight
        headers.push(await configureOrigin(options, req));
        headers.push(await configureCredentials(options))
        headers.push(await configureMethods(options))
        headers.push(await configureAllowedHeaders(options, req));
        headers.push(await configureMaxAge(options))
        headers.push(await configureExposedHeaders(options))
        await applyHeaders(headers, res);

        if (options.preflightContinue) {
            await next();
        } else {
            // Safari (and potentially other browsers) need content-length 0,
            //   for 204 or they just hang waiting for a body
            res.statusCode = options.optionsSuccessStatus;
            res.setHeader('Content-Length', '0');
            res.end();
        }
    } else {
        // actual response
        headers.push(await configureOrigin(options, req));
        headers.push(await configureCredentials(options))
        headers.push(await configureExposedHeaders(options))
        await applyHeaders(headers, res);
        await next();
    }
}

const middlewareWrapper = async (o?: any) => {
    // if options are static (either via defaults or custom options passed in), wrap in a function
    let optionsCallback: (req: Request<any>, cb: any) => Promise<void>;
    if (typeof o === 'function') {
        optionsCallback = o;
    } else {
        optionsCallback = async (req: Request<any>, cb: any) => {
            await cb(null, o);
        };
    }

    return async (req: Request<any>, res: Response, next: NextFunc) => {
        await optionsCallback(req, async (err: any, options: any) => {
            if (err) {
                return res.status(500).body({
                    err: err,
                    meta: {
                        module: "AxonCors",
                        root: "optionsCallback",
                        line: 203
                    }
                });
                // await next(err);
            } else {
                const corsOptions = assign({}, defaults, options);
                let originCallback = null;
                if (corsOptions.origin && typeof corsOptions.origin === 'function') {
                    originCallback = corsOptions.origin;
                } else if (corsOptions.origin) {
                    originCallback = async (origin: any, cb: any) => {
                        await cb(null, corsOptions.origin);
                    };
                }

                if (originCallback) {
                    await originCallback(req.headers.origin, async (err2: any, origin: any) => {
                        if (err2 || !origin) {
                            return res.status(500).body({
                                err: err,
                                meta: {
                                    module: "AxonCors",
                                    root: "optionsCallback",
                                    line: 225
                                }
                            });
                            // await next(err2);
                        } else {
                            corsOptions.origin = origin;
                            await cors(corsOptions, req, res, next);
                        }
                    });
                } else {
                    await next();
                }
            }
        });
    };
}

export default {
    middlewareWrapper
};