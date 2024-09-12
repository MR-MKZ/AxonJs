import { Router } from "../../src";

const router = Router();

router.get('/user/:name', async (req, res) => {
    
    return {
        body: {
            message: `Hello ${req.params.name}`
        },
        responseCode: 200
    }
})

export { router as v1Routes }