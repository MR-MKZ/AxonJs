import { Router } from "../../src";

// you can set route prefix in Router
const router = Router("/api/v1")

router.get('/hello', async (req, res) => {
    
    console.log(req.url);
    
    return res.status(200).body({
        url: req.url
    })
})

export { router as v2Routes }