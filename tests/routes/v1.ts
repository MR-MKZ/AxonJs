import { Router } from "../../src";

const router = Router();

router.get('/', async (req, res) => {

    console.log(req.url);
    
    return {
        body: {
            message: "hello"
        },
        responseCode: 200
    }
})

export { router as v1Routes }