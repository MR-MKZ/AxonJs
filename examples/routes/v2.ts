import { Router } from "../../src";

// you can set route prefix in Router
const router = Router("/api/v1")

router.get('/{name}([a-z]+)/{id}(\\d+)', async (req, res) => {
    return res.status(200).body({
        url: req.url,
        params: req.params,
        query: req.query
    })
})

export { router as v2Routes }