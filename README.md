# Axon.js

**like the brain's powerful neural pathways, simple yet strong.**

Axon is a backend library who tries to be simple and powerfull.

Currently Axon is 2X faster than Express. :D please checkout [Axon Benchmarks](./benchmarks/README.md)

[Axon telegram channel](https://t.me/axonjs)

Latest change: 
- Https support added to AxonCore. [#17](https://github.com/MR-MKZ/AxonJs/issues/17)
- Plugin manager system added to core. (Document will update soon - 2024/10/24)



## Installation

Install Axon.js with npm

```bash
  npm install @mr-mkz/axon
```

## Benchmarks

You can checkout Axon benchmarks document and results from below link.

[Axon Benchmarks](./benchmarks/README.md)
    
## Badges

<p align="center">
    <a href="#">
        <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/mr-mkz/axonjs/npm-publish.yml">
    </a>
    <a href="https://www.npmjs.com/package/@mr-mkz/axon">
        <img alt="NPM Downloads" src="https://img.shields.io/npm/dy/%40mr-mkz%2Faxon?label=NPM%20Downloads&color=%235304db">
    </a>
</p>
<p align="center">
    <a href="#">
        <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/mr-mkz/axonjs?color=%23be04db">
    </a>
    <a href="#">
        <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/%40mr-mkz%2Faxon">
    </a>
    <a href="https://www.npmjs.com/package/@mr-mkz/axon">
        <img alt="NPM Version" src="https://img.shields.io/npm/v/%40mr-mkz%2Faxon?label=NPM%20release&color=%2304dba9">
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

- Support controllers better than now.
- Some changes in response structure.
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
        const router = Router()

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
            router.get('/', controller).middleware(async (req, res, next) => next());
        ```
        you can also use multiple middlewares for a route by repeating middleware function and middlewares will run in order.
2. loading middleware as a global middleware in Axon core.
    - Example:
        ```js
            core.globalMiddleware(async (req, res, next) => next());
        ```
        you can also use multiple middlewares in this way by adding middleware functions into an array (suggested method) or repeating this line of code.

### Types

AxonJs has some types which can help you in developing your applications for auto suggestions of your code editor.

**Types detect automatically in Typescript but you need to set types for IDE suggestions in Javascript ([*Javascript Example*](./examples/index.js)).**

- `AxonCoreConfig`: Type of core config object for configuration Axon core as you want.
- `AxonResponseMessage`: Type of core config option RESPONSE_MESSAGES.
- `AxonCorsConfig`: Type of core config option CORS.
- `AxonHttpsConfig`: Type of core config option HTTPS.
- `Request`: Type of controller request param. (IncomingMessage)
- `Response`: Type of controller response param. (ServerResponse)
- `Headers`: Type of response headers. (OutgoingHeaders)
- `nextFn`: Type of next function param in middleware.
- `Controller`: Type of controller function.
- `Middleware`: Type of middleware function.

### Axon Core config

you can config Axon core with `loadConfig` method.
if you want to have ide suggestions for core config use AxonCoreConfig type.

Usage:
```js
core.loadConfig({
    LOGGER: false
})
```

Configs:

- `DEBUG`: boolean to set debug mode of core. (default false)
- `LOGGER`: boolean to set core logger on or off. (default true)
- `LOGGER_VERBOSE`: boolean to set core logger in verbose mode. (default false)
- `RESPONSE_MESSAGES`: object to change default value of some core responses. (type: AxonResponseMessage)
- `CORS`: object to change core cors settings. (type: AxonCorsConfig)
- `HTTPS`: object to config server for https. (type: AxonHttpsConfig)

### Running server

`listen` method runs your webserver.

**If you want to run your server on https, you have to set key and cert file in HTTPS config of core to run https server automatically by core**

```js
core.loadConfig({
    HTTPS: {
        key: fs.readFileSync(path.join("server.key")),
        cert: fs.readFileSync(path.join("server.crt"))
    }
})
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

## Contributing

Contributions are always welcome!

## Authors

- [@Mr-MKZ](https://www.github.com/Mr-MKZ)
