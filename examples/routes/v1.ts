import { FuncController, Router, Request } from "../../src";

import { z } from "zod";
import * as yup from "yup";
import Joi from "joi";

const router = Router();

interface Params {
    id?: string
}

// Sample controller
const testController: FuncController = async (req: Request<Params>, res) => {
    req.params?.id
}

/**
 * There are some sample validation schemas which you can use in project in the easiest and the fastest way.
 * 
 * You can use Joi, Zod and Yup as your validation libraries and all of these three libraries are supported with AxonValidator.
 */

// --- Joi for BODY validation ---
const bodySchema = Joi.object({
    username: Joi.string().min(3).required(),
    age: Joi.number().integer().min(0).required()
});

// --- Zod for QUERY validation ---
const querySchema = z.object({
    search: z.string().min(1),
    limit: z.coerce.number().min(1).max(100).default(10)
});

// --- Yup for PARAMS validation ---
const paramsSchema = yup.object({
    id: yup.string().uuid().required()
});


// also you can add one or multiple middlewares for specific route like this.
// you can add another middleware by repeating this function. they will run in order.
// example: router.get().middleware().middleware()
router.post('/user/{id}', async (req, res) => {
    return res.status(201).body({
        message: 'All inputs are valid!',
        data: {
            body: req.body,
            query: req.query,
            params: req.params
        }
    })
}, [
    {
        schema: bodySchema,
        target: "body",
        options: {
            abortEarly: false
        } as Joi.ValidationOptions
    },
    {
        schema: querySchema,
        target: "query",
        options: {
            path: ['Query Schema']
        } as z.ParseParams
    },
    {
        schema: paramsSchema,
        target: "params",
        options: {
            abortEarly: false,
            strict: true
        } as yup.ValidateOptions
    }
]).middleware(async (req, res, next) => {
    return next();
});

/**
 * Test request for above route path
 * 
 * curl --location --request POST '127.0.0.1:3000/user/123e4567-e89b-12d3-a456-426614174000?search=John&limit=5' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "username": "JohnDoe",
        "age": 30
    }'
 */

export { router as v1Routes }