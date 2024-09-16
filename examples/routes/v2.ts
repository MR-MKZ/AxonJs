import { Router } from "../../src";

const router = Router()

router.get('/hello', async (req, res) => {
    
    console.log(req.url);
    
    return res.status(200).body({
        url: req.url
    })
})

export { router as v2Routes }