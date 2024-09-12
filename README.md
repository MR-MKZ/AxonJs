# Axon.js

**like the brain's powerful neural pathways, simple yet strong.**

Axon is a backend library who tries to be simple and powerfull.



## Installation

Install Axon.js with npm

```bash
  npm install @mr-mkz/axon
```
    
## Badges

<p align="center">
    <a href="#">
        <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/mr-mkz/axonjs/npm-publish.yml">
    </a>
    <a href="https://www.npmjs.com/package/@mr-mkz/axon">
        <img alt="jsDelivr hits (npm)" src="https://img.shields.io/jsdelivr/npm/hy/%40mr-mkz%2Faxon">
    </a>
    <a href="https://www.npmjs.com/package/@mr-mkz/axon">
        <img alt="NPM Downloads" src="https://img.shields.io/npm/dy/%40mr-mkz%2Faxon?label=NPM%20Downloads&color=%235304db">
    </a>
    <a href="https://github.com/Mr-MKZ/AxonJs/releases/latest">
        <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/mr-mkz/axonjs/total?style=flat&label=Github%20Downloads&color=%235bc912">
    </a>
</p>
<p align="center">
    <a href="#">
        <img alt="GitHub Issues or Pull Requests" src="https://img.shields.io/github/issues/mr-mkz/axonjs?color=%23be04db">
    </a>
    <a href="#">
        <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/%40mr-mkz%2Faxon">
    </a>
    <a href="#">
        <img alt="GitHub Release" src="https://img.shields.io/github/v/release/mr-mkz/axonjs?label=Github%20release">
    </a>
    <a href="https://www.npmjs.com/package/@mr-mkz/axon">
        <img alt="NPM Version" src="https://img.shields.io/npm/v/%40mr-mkz%2Faxon?label=NPM%20release&color=%2304dba9">
    </a>
</p>

## Features

- Simple routing system
- Support methods: GET, POST, PUT, PATCH, DELETE, OPTIONS. more methods soon...
- Flexible routing system. (You can define routes in another files and then add them to core)
- Default core logger (still developing)
- Configurable core

**More features soon...**

## Roadmap (still thinking)

- Support controllers better than now.
- Support middlewares.
- Some changes in response structure.
- Response meta generator.
- Logger system. [In Progress]
- Auto error detector (maybe)
- Default schemas.
- Default database connection methods.

## Documentation

Currently Axon has a main core and a router class which you can make instance from router class every where you want and then gave the router instance to core to load routes.

More complete examples:
- [Typescript Example](./tests/index.ts)
- [Javascript Example](./tests/index.js)

Example:
```js
import { AxonCore, Router } from "@mr-mkz/axon";

// Axon core instance
const core = new AxonCore();

// configuring core (not completed)
core.loadConfig({
    DEBUG: true,            // default false
    LOGGER: true,           // default true
    LOGGER_VERBOSE: false   // default false
})

// Router instance function
const router = Router();

// route with method GET.
// all methods: [get, post, put, patch, delete, options]
router.get('/', async (req, res) => {
    return {
        body: {},
        headers: {}, // optional
        responseCode: 200,
        responseMessage: "OK" // optional
    }
})

// Giving routes to Axon core
core.loadRoute(router)

// Giving routes to Axon core with prefix
core.loadRoute(router, "/api/v1")

// Starting server
// callback function is optional and core has default log message for on start event
// core.listen("127.0.0.1", 8000)
core.listen("127.0.0.1", 8000, () => {
    console.log("Listening on port 8000...")
})
```

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
        const core = new AxonCore();

        core.loadRoute(router)
4. Done, you created your routes successfully :D

### Controller

Controller is still under constructnig but currently it work like this:

you have to pass your controller to your route, compute and do your jobs in controller and when you want to response to user (each response, error and success) you must return an object with type `JsonResponse`.

```js
import { JsonResponse } from "@mr-mkz/axon";

/**
 * Controller jsdoc (ts detect types automatically)
 * @returns {JsonResponse}
 */
```

Or

```js
/**
 * Controller jsdoc (ts detect types automatically)
 * @returns {import("@mr-mkz/axon").JsonResponse}
 */
```

### Types

AxonJs has some types which can help you in developing your applications for auto suggestions of your code editor.

**Types detect automatically in Typescript but you need to set types for IDE suggestions in Javascript ([*Javascript Example*](./tests/index.js)).**

- `JsonResponse`: Type of controller response object which must return to response the user request.
- `AxonCoreConfig`: Type of core config object for configuration Axon core as you want.
- `Request`: Type of controller request param. (IncomingMessage)
- `Response`: Type of controller response param. (ServerResponse)
- `Headers`: Type of response headers. (OutgoingHeaders)

## Contributing

Contributions are always welcome!

## Authors

- [@Mr-MKZ](https://www.github.com/Mr-MKZ)