import { Router } from "../../src";

const router = Router();

// also you can add one or multiple middlewares for specific route like this.
// you can add another middleware by repeating this function. they will run in order.
// example: router.get().middleware().middleware()
router.get('/user/:name', async (req, res) => {

    console.log("Controller");

    return res.status(201).body({ message: `Hello ${req.params.name}` })
}).middleware(async (req, res, next) => {
    next()
})

export { router as v1Routes }