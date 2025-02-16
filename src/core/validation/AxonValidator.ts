// ! This code is under constructing and currently didn't add to core.

import * as yup from "yup";
import joi from "joi";
import { ZodSchema, z } from "zod";

import { Middleware } from "../../types/GlobalTypes";
import { logger } from "../utils/coreLogger";

type validationSchema = joi.Schema | ZodSchema | yup.Schema;
type validationConfig = joi.ValidationOptions | z.ParseParams | yup.ValidateOptions;

const generateValidationMiddleware = async (schema: validationSchema, options: validationConfig): Promise<Middleware> => {
    if (schema instanceof yup.Schema) {

        // TODO: How can Core detect which parameter needs validation.
        // TODO: Check the other validation schema passing ways.
        // TODO: Test validate method for Axon Route Handler.
        const middleware: Middleware = async (req, res, next) => {
            try {
                await schema.validate({}, (options as yup.ValidateOptions));

                return await next();
            } catch (error) {
                if (error instanceof yup.ValidationError) {
                    return res.status(400).body({
                        message: error.message,
                        errors: error.errors
                    });
                }

                logger.error(error);

                return res.status(500).body({
                    message: "Internal server error"
                });
            }
        }

        return middleware;
    } else if (schema instanceof ZodSchema) {
        const middleware: Middleware = async (req, res, next) => {
            try {
                // await schema.validate({}, (options as yup.ValidateOptions));

                return await next();
            } catch (error) {
                if (error instanceof yup.ValidationError) {
                    return res.status(400).body({
                        message: error.message,
                        errors: error.errors
                    });
                }
            }
        }

        return middleware;
    } else if (joi.isSchema(schema)) {
        const middleware: Middleware = async (req, res, next) => {
            try {
                // await schema.validate({}, (options as yup.ValidateOptions));

                return await next();
            } catch (error) {
                if (error instanceof yup.ValidationError) {
                    return res.status(400).body({
                        message: error.message,
                        errors: error.errors
                    });
                }
            }
        }

        return middleware;
    } else {
        throw new Error("Validation schema is not valid", {
            cause: {
                message: "You have to use one of these libraries for validation: Yup, Joi, Zod"
            }
        });
    }
}

export default {
    generateValidationMiddleware
}