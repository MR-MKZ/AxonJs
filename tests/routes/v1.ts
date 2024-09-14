import { Router } from "../../src";

const router = Router();

router.get('/user/:name', async (req, res) => {
    // console.log("controller");

    console.log("contrller");
    

    return res.status(201).setHeader("ssjkdfsd", "asd").body("erfan")
    
    // return {
    //     body: {
    //         message: `Hello ${req.params.name}`
    //     },
    //     responseCode: 200
    // }
}).middleware(async (req, res, next) => {
    console.log("middleware 4");
    return res.status(403).body("ridi dash")
    next()
})

export { router as v1Routes }