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

**More features soon...**

## Roadmap (still thinking)

- Support controllers better than now.
- Support middlewares.
- Some changes in response structure.
- Response meta generator.
- Logger system.
- Auto error detector (maybe)
- Default schemas.
- Default database connection methods.

## Documentation

Currently Axon has a main core and a router class which you can make instance from router class every where you want and then gave the router instance to core to load routes.

Example:
```js
import { HttpRouterCore, Router } from "@mr-mkz/axon";

// Axon core instance
const core = new HttpRouterCore();
// Router instance
const router = new Router();

// route with method GET.
// all methods: [get, post, put, patch, delete, options]
router.get('/', async () => {
    return {
        body: {},
        headers: {}, // optional
        responseCode: 200,
        responseMessage: "OK" // optional
    }
})

// Giving routes to Axon core
core.loadRoute(router)

// Starting server
core.listen(8000, () => {
    console.log("Listening on port 8000...")
})
```

## Contributing

Contributions are always welcome!

## Authors

- [@Mr-MKZ](https://www.github.com/Mr-MKZ)