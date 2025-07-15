<center>
<img src="https://github.com/user-attachments/assets/620caf8f-fc68-4d1c-bd9d-e200a033f579" >
</center>

# Axon.js

**like the brain's powerful neural pathways, simple yet strong. 🧠**

Axon is a backend library that aims to be simple and powerfull.

Currently Axon is 2X faster than Express. :D please checkout [Axon Benchmarks](./benchmarks/README.md)

[Axon telegram channel](https://t.me/axonjs)

Latest change: (v0.12.0)

- Dependency injection
  Fixed some problems and dependency injection system redesigned.
  1. Register your dependency into the Axon core:

     ```typescript
     // class instance
     core.registerDependencyValue('dependencyName', new DependencyClass(arg1, arg2));

     // class with factory function (core will run factory function before injection process)
     core.registerDependencyFactory('dependencyName2', () => new DependencyClass());

     // function
     core.registerDependencyValue('dependencyName3', dependencyFunction);

     // Also you can register dependencies with name aliases
     core.registerDependencyValue(['depClass', 'classDep', 'DB'], new DependencyClass());
     ```
- NeuronContainer service
  Neuron Container is a service to create and handle dependency containers in your project.
  Also Axon core is using Neuron Container for dependency injection feature.
  ```typescript
  import { NeuronContainer } from "@axonlabs/core";

  const container = new NeuronContainer();
  container.registerValue();
  container.registerFactory();
  container.register();
  container.resolve();
  container.use();
  container.clone();
  container.clearScope();
  container.checkDependency();
  container.override();
  container.listDependencies();
  container.inspect();
  ```

Past changes:

#### (v0.12.0)

- Dependency injection
  Axon's new feature is dependency injection for class methods and controller functions.
  support for class constructor and middlewar;es will add soon.
  How to use:
  1. Register your dependency into the Axon core:

     ```typescript
     // class instance
     core.registerDependencyValue('dependencyName', new DependencyClass(arg1, arg2));

     // class with factory function (core will run factory function before injection process)
     core.registerDependencyFactory('dependencyName2', () => new DependencyClass());

     // function
     core.registerDependencyValue('dependencyName3', dependencyFunction);

     // Also you can register dependencies with name aliases
     core.registerDependencyValue(['depClass', 'classDep', 'DB'], new DependencyClass());
     ```

  2. Use you dependency in controller

     ```typescript
     // When you want to use dependencies, make sure you enter exact dependency name or alias
     // in 3rd argument of controller method or function into the object.
     interface IDependencies {
       DB: DependencyClass;
       dependencyName3: (...args: any[]) => any;
     }

     class UserController extends BaseController {
       async index(req: Request<any>, res: Response, { DB, dependencyName3 }: IDependencies) {
         const result = dependencyName3();
         const db = DB.get();
       }
     }

     // Or functional controller:
     const getUsers = async (
       req: Request<any>,
       res: Response,
       { DB, dependencyName3 }: IDependencies
     ) => {
       const result = dependencyName3();
       const db = DB.get();
     };

     router.get('/users/class', [UserController, 'index']);
     router.get('/users/function', getUsers);
     ```

#### (v0.11.0)

- Class-Based Controllers
  You can use the new generation of controllers in Axon.
  In class-based controllers you can use state managing of classes in your application without any instance making.
  More organized controllers!

  ```ts
  class UsersController extends BaseController {
    async index(req: Request<any>, res: Response) {
      return res.status(200).body({});
    }
  }

  // [Class, Method]
  router.get('/users', [UsersController, 'index']);
  ```

  Your controller class must extends from BaseController, Otherwise the router will throw error.

  ```ts
  class UsersController {
    async index(req: Request<any>, res: Response) {
      return res.status(200).body({});
    }
  }

  router.get('/users', [UsersController, 'index']);

  // Error: Controller class must extends from BaseController
  ```

#### (v0.10.0)

- Cookie manager added to Axon.
  You can access cookie manager by importing AxonCookie class in your code.
  AxonCookie has some static methods for managing cookies easily.
  Example:

  ```ts
  import { AxonCookie } from '@axonlabs/core';

  AxonCookie.set(res, name, value, options);
  AxonCookie.parse(req);
  AxonCookie.clear(res, name, options);
  ```

#### (v0.9.0)

- Plugin system updated.
- Project environment state added to core config.
- Validation system added to router.

> [!WARNING]
> @mr-mkz/axon deprecated and transferred to @axonlabs/core

## Installation 📥

Install Axon.js with npm

```bash
  npm install @axonlabs/core
```

## Benchmarks 🧪

You can checkout Axon benchmarks document and results from below link.

[Axon Benchmarks](./benchmarks/README.md)

## Badges 📛

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

<p align="center">
    <a href="https://deepwiki.com/AxonJsLabs/AxonJs">
        <img alt="Ask DeepWiki" src="https://deepwiki.com/badge.svg">
    </a>
</p>

## Features 💡

- Simple routing system
- Support methods: GET, POST, PUT, PATCH, DELETE, OPTIONS.
- Flexible routing system. (You can define routes in another files and then add them to core)
- Default core logger
- Configurable core
- Plugin manager (You can create your own plugins and use them in other projects)
- Controllers and Middlewares
- Default cors configuration method
- Support https server
- Auto validation handler (Yup, Zod, Joi)

**More features soon...**

## Roadmap (still thinking) 🚦

- Response meta generator.
- Auto error detector (maybe)
- Default schemas.
- Default database connection methods.
- Improve plugin system
  - Core versioning
  - Plugin dependencies
- Improve AxonCore
  - Cleaner code

## Documentation 📚

Currently Axon has a main core and a router class which you can make instance from router class every where you want and then gave the router instance to core to load routes.

More complete examples:

- [Typescript Example](./examples/index.ts)
- [Javascript Example](./examples/index.js)

### Router 🧭

#### Methods

Router is stil under constructing and it's not a stable version yet but currently it support this methods:

- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS

#### Validation system

One on the new features of Axon Router is auto validation system.
This feature works with Joi, Yup and Zod schema to create validation middlewares automatically without any additional code.
Target of this system is speeding up programmers and also using validation systems in middleware instead of controller to prevent additional requests and code in controller.

```ts
const authFormSchema = Joi.object({
  username: Joi.string().min(3).required(),
  age: Joi.number().integer().min(0).required(),
});

// You can register your validation schema with your options for any target and then
// register it to route after controller
// Also you can write this code directly in route function but it's not really clean.
const validation: ValidationObj[] = [
  {
    schema: authFormSchema, // must be schema of yup, joi or zod
    options: {
      // must be options of yup, joi or zod based on your schema
      abortEarly: false,
    } as Joi.ValidationOptions,
    target: 'body', // your validation schema target (body, params, query)
  },
];
```

Registering validations:

```ts
router.post('/users/login', controller, validation);
// or
router.post('/users/login', controller, [
  {
    // your validation config
  },
]);
```

#### Router usage example

You can access and create routes with just a few steps.

1. creating a variable with a optional name and put `Router()` function in it.
2. define your routes with methods which you want and controller.
   - ```ts
     // route prefix is optional
     const router = Router('prefix'); // easier and newer method
     // or
     // const router = new AxonRouter('prefix');

     const validation: ValidationObj[] = [
       {
         schema: authFormSchema,
         options: {
           abortEarly: false,
         } as Joi.ValidationOptions,
         target: 'body',
       },
     ];

     router.get(path, controller(req, res), validation);
     ```

3. load your routes in core with `loadRoute()` function;
   - ```js
     const core = Axon(); // easier and newer method
     // or
     // const core = new AxonCore();

     core.loadRoute(router);
     ```

4. Done, you created your routes successfully :D

### Controller 🛂

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
    message: 'Hello, World',
  });
};
```

### Middleware 🚓

middleware is a function which runs before running controller for validations or some actions like this and you can use it in two ways.

1. adding a middleware for special route
   - Example:
     ```js
     router
       .get('/', controller)
       .middleware(async (req, res, next) => next(), (timeout = 2000), (critical = true));
     ```
     you can also use multiple middlewares for a route by repeating middleware function and middlewares will run in order.
2. loading middleware as a global middleware in Axon core.
   - Example:
     ```js
     core.globalMiddleware(async (req, res, next) => next(), (timeout = 2000), (critical = true));
     ```
     you can also use multiple middlewares in this way by adding middleware functions into an array (suggested method) or repeating this line of code.

Middlewares support a timeout when the process takes too long. You can set a global timeout in the config using a specific key `MIDDLEWARE_TIMEOUT`. When you set critical to `true`, the middleware is marked as critical; if encounters an error or returns a timeout error, the request chain will break, resulting in an internal server error (500) sent to the client, and the request will closeAdditionally, the error will be logged in the console. If the middleware is non-critical (`false`), the core will skip it and continue processing the response to the client, logging a warning in the console afterward.

### Types

AxonJs has some types which can help you in developing your applications for auto suggestions of your code editor.

**Types detect automatically in Typescript but you need to set types for IDE suggestions in Javascript ([_Javascript Example_](./examples/index.js)).**

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
- `ValidationObj`: Required object for router auto validation process.
- `ValidationConfig`: Config type of AxonValidator. (including joi, yup and zod config options)
- `ValidationSchema`: Schema type of AxonValidator.
- `ValidationTargets`: Target list of AxonValidator.

### Axon Core logger (pino & pino-pretty)

AxonJs use pino and pino-pretty for it's logger and you can use this instance of logger with importing it from `@axonlabs/core`.

Logger configuration options will add to config file as soon as possible.

**For more information about the pino logger read [official documentation](https://getpino.io/) of this library.**

```typescript
import { axonLogger } from '@axonlabs/core';
// or
const { axonLogger } = require('@axonlabs/core');
```

**Plugins must use plugin mode of logger.**

Example:

```typescript
import { axonLogger } from '@axonlabs/core';

axonLogger.plugin('Something to log');
axonLogger.info('Something to log');
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

### Running server 🔑

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
core.listen('0.0.0.0', 80, () => {
  console.log('server is running on port 80');
});
```

### Closing/Stopping server 🛑

`close` method closes your webserver.

```js
core.close(); // close all servers
core.close('http'); // close http server
core.close('https'); // close https server
```

## Contributing

Contributions are always welcome!

## Authors

- [@Mr-MKZ](https://www.github.com/Mr-MKZ)
