# Axon.js


**like the brain's powerful neural pathways, simple yet strong.**

Axon is a backend library who tries to be simple and powerfull.


Currently Axon is 2X faster than Express. :D please checkout [Axon Benchmarks](./benchmarks/README.md)

[Axon telegram channel](https://t.me/axonjs)

Latest change: 
- Router core refactored and some new feature added.
    - **Update**: Set params synatax changed from `/:id` to `/{id}`
    - **New**: Now params support regex. `/{param}(regex)` => `/{id}(\\d+)`
    - **New**: Now core support query parameters
    - **New**: Route params type safed. 
        ```ts
        router.get('/{name}', async (req, res) => {
            console.log(req.params?.name) // type: Request<{ name: string }>
        });

        // or 
        interface Params {
            name: string
        }

        const handler = async (req: Request<Params>, res: Response) => {
            console.log(req.params?.name) // type: Request<{ name: string }>
        }

        router.get('/{name}', handler);
        ```
    - **Remove**: path-to-regexp removed from dependencies
    - **New**: `close` method added to core for closing a server programmetically.
        ```ts
        core.close(); // close all servers
        core.close("http"); // close http server
        core.close("https"): // close https server
        ```
    - **New**: `getServers` method added to core for getting web server instances which using by core.
        ```ts
        interface AxonServers {
            http: http.Server | null;
            https: https.Server | null;
        }

        const servers: AxonServers = core.getServers();
        servers.http.on('request', () => {
            // something to do
        });
        ```
    - **New**: `getConfig` method added to core got getting loaded config which using by core.
    - **New**: Middleware chain logic has been improved, and now middlewares support a timeout when the process takes too long or if the next function isn't called while the user  connection remains open. You can set a global timeout in the config using a specific key `MIDDLEWARE_TIMEOUT`.
        ```ts
        // set timeout of middleware to 2000ms and set middleware mode to critical.
        router.get('/', async (req, res) => {})
            .middleware(
                async (req, res, next) => {},
                timeout = 2000,
                critical = true
            );

        // also in global middlewares
        core.globalMiddleware(
            async (req, res, next) => {},
            timeout = 2000,
            critical = true
        );
        ```
        When you set critical to `true`, the middleware is marked as critical; if it encounters an error or returns a timeout error, the request chain will break, resulting in an internal server error (500) sent to the client, and the request will close. Additionally, the error will be logged in the console. If the middleware is non-critical (`false`), the core will skip it and continue processing the response to the client, logging a warning in the console afterward.

> [!WARNING]
> @mr-mkz/axon deprecated and transferred to @axonlabs/core

## Installation

Install Axon.js with npm

```bash
  npm install @axonlabs/core
```

## Benchmarks

You can checkout Axon benchmarks document and results from below link.

[Axon Benchmarks](./benchmarks/README.md)
    
## Badges

<p align="center">
    <a href="https://www.npmjs.com/package/@axonlabs/core">
        <img alt="@axonlabs/core Downloads" src="https://img.shields.io/npm/dy/%40axonlabs%2Fcore?label=@axonlabs/core Downloads&color=%235304db">
    </a>
</p>
<p align="center">
    <a href="https://www.npmjs.com/package/@mr-mkz/axon">
        <img alt="@mr-mkz/axon Downloads" src="https://img.shields.io/npm/dy/%40mr-mkz%2Faxon?label=@mr-mkz/axon Downloads&color=%235304db">
    </a>
</p>
<p align="center">
    <a href="https://www.npmjs.com/package/@axonlabs/core">
        <img alt="NPM Version" src="https://img.shields.io/npm/v/%40axonlabs%2Fcore?label=NPM%20release&color=%2304dba9">
    </a>
    <a href="#">
        <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/axonjslabs/axonjs/npm-publish.yml">
    </a>
</p>
<p align="center">
    <a href="#">
        <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/axonjslabs/axonjs?color=%23be04db">
    </a>
    <a href="#">
        <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/%40axonlabs%2Fcore">
    </a>
</p>

## Features

- Simple routing system
- Support methods: GET, POST, PUT, PATCH, DELETE, OPTIONS.
- Flexible routing system. (You can define routes in another files and then add them to core)
- Default core logger 
- Configurable core
- Plugin manager (You can create your own plugins and use them in other projects)
- Controllers and Middlewares
- Default cors configuration method
- Support https server

**More features soon...**

## Roadmap (still thinking)

- Response meta generator.
- Auto error detector (maybe)
- Default schemas.
- Default database connection methods.

## Documentation

Currently Axon has a main core and a router class which you can make instance from router class every where you want and then gave the router instance to core to load routes.

More complete examples:
- [Typescript Example](./examples/index.ts)
- [Javascript Example](./examples/index.js)

### Router

Router is stil under constructing and it's not a stable version yet but currently it support this methods:

- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS

You can access and create routes with just a few steps.

1. creating a variable with a optional name and put `Router()` function in it.
2. define your routes with methods which you want and controller.
    - ```js
        // route prefix is optional
        const router = Router('prefix') // easier and newer method
        // or
        // const router = new AxonRouter('prefix');

        router.get(path, controller(req, res))
        ```
3. load your routes in core with `loadRoute()` function;
    - ```js
        const core = Axon(); // easier and newer method
        // or
        // const core = new AxonCore();

        core.loadRoute(router)
4. Done, you created your routes successfully :D

### Controller

you have to pass your controller to your route, compute and do your jobs in controller and when you want to response to user (each response, error and success) you must return res with some options which example and description for each option is below.

```js
res.{option}
```

Options:

- status: This option must set to get access to other options. (you can use each option just once)
- message: This option will set the response message for example response message of status 200 is OK.
- setHeader: You can set header with this option and also you can use this option many times.
- body: This option will end request and send response to user so you must use this as last option

Example:
```js
const controller = async (req, res) => {
    return res.status(200).body({
        message: "Hello, World"
    })
}
```

### Middleware

middleware is a function which runs before running controller for validations or some actions like this and you can use it in two ways.

1. adding a middleware for special route
    - Example:
        ```js
            router.get('/', controller).middleware(async (req, res, next) => next(), timeout = 2000, critical = true);
        ```
        you can also use multiple middlewares for a route by repeating middleware function and middlewares will run in order.
2. loading middleware as a global middleware in Axon core.
    - Example:
        ```js
            core.globalMiddleware(async (req, res, next) => next(), timeout = 2000, critical = true);
        ```
        you can also use multiple middlewares in this way by adding middleware functions into an array (suggested method) or repeating this line of code.

Middlewares support a timeout when the process takes too long or if the next function isn't called while the useconnection remains open. You can set a global timeout in the config using a specific key `MIDDLEWARE_TIMEOUT`. When you set critical to `true`, the middleware is marked as critical; if iencounters an error or returns a timeout error, the request chain will break, resulting in an internal server error (500) sent to the client, and the request will closeAdditionally, the error will be logged in the console. If the middleware is non-critical (`false`), the core will skip it and continue processing the response to thclient, logging a warning in the console afterward.

### Types

AxonJs has some types which can help you in developing your applications for auto suggestions of your code editor.

**Types detect automatically in Typescript but you need to set types for IDE suggestions in Javascript ([*Javascript Example*](./examples/index.js)).**

- `AxonCoreConfig`: Type of core config object for configuration Axon core as you want.
- `AxonResponseMessage`: Type of core config option RESPONSE_MESSAGES.
- `AxonCorsConfig`: Type of core config option CORS.
- `AxonHttpsConfig`: Type of core config option HTTPS.
- `Request<Params>`: Type of controller request param. (IncomingMessage)
- `Response`: Type of controller response param. (ServerResponse)
- `Headers`: Type of response headers. (OutgoingHeaders)
- `NextFunc`: Type of next function param in middleware.
- `Controller`: Type of controller function.
- `Middleware`: Type of middleware function.
- `HttpMethods`: Type of router http methods.
- `RouterExceptionError`: Type of router exceptions.

### Axon Core logger (pino & pino-pretty)

AxonJs use pino and pino-pretty for it's logger and you can use this instance of logger with importing it from `@axonlabs/core`.

Logger configuration options will add to config file as soon as possible.

**For more information about the pino logger read [official documentation](https://getpino.io/) of this library.**

```typescript
import { axonLogger } from "@axonlabs/core";
// or
const { axonLogger } = require("@axonlabs/core");
```

**Plugins must use plugin mode of logger.**

Example:
```typescript
import { axonLogger } from "@axonlabs/core";

axonLogger.plugin("Something to log");
axonLogger.info("Something to log");
```

### Axon Core config

You can config Axon core with creating a file in your project root directory.

#### Acceptable files:
- `axon.config.js`
- `axon.config.ts`
- `axon.config.cjs`
- `axon.config.mjs`

If you want to have ide suggestions for core config use AxonConfig type.

Configs:

- `DEBUG`: boolean to set debug mode of core. (default false)
- `LOGGER`: boolean to set core logger on or off. (default true)
- `LOGGER_VERBOSE`: boolean to set core logger in verbose mode. (default false)
- `RESPONSE_MESSAGES`: object to change default value of some core responses. (type: AxonResponseMessage)
- `CORS`: object to change core cors settings. (type: AxonCorsConfig)
- `HTTPS`: object to config server for https. (type: AxonHttpsConfig)
- `MIDDLEWARE_TIMEOUT`: variable to set global timeout of waiting for middleware to response or call next function. (ms, default 10000ms)

### Running server

`listen` method runs your webserver.

**If you want to run your server on https, you have to set key and cert file in HTTPS config of core to run https server automatically by core**

```js
// put this in config file (axon.config.js .etc)
HTTPS: {
    key: fs.readFileSync(path.join("server.key")),
    cert: fs.readFileSync(path.join("server.crt"))
}
```

**`core.listen()` has some default values**
1. host: default value of host in 127.0.0.1
2. port: default value of port is 8000
3. callback: if you don't set callback function, core will log running message automatically if logger be on in core config.(logger is on in default config)

```js
core.listen("0.0.0.0", 80, () => {
    console.log("server is running on port 80")
});
```

### Closing/Stopping server

`close` method closes your webserver.

```js
core.close(); // close all servers
core.close("http"); // close http server
core.close("https"); // close https server
```

## Contributing

Contributions are always welcome!

## Authors

- [@Mr-MKZ](https://www.github.com/Mr-MKZ)
