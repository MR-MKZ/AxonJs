import { FuncController, Router, Request } from "../../src";

const router = Router();

interface Params {
    id?: string
}

const testController: FuncController = async (req: Request<Params>, res) => {
    req.params?.id
}

// also you can add one or multiple middlewares for specific route like this.
// you can add another middleware by repeating this function. they will run in order.
// example: router.get().middleware().middleware()
router.get('/user/{name}', async (req, res) => {
    req.params?.name
    return res.status(201).body({ message: `Hello ${req.params.name}` })
}).middleware(async (req, res, next) => {
    next()
})

export { router as v1Routes }