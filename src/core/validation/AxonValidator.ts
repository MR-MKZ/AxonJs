import * as yup from "yup";
import joi from "joi";
import { ZodSchema, z } from "zod";

import { Middleware } from "@/types/RouterTypes";

import type {
    ValidationConfig,
    ValidationSchema,
    ValidationTargets
} from "../../types/ValidatorTypes";

export class AxonValidator {
    static validate(schema: ValidationSchema, options?: ValidationConfig, target: ValidationTargets = "body"): Middleware {
        return async (req, res, next) => {
            try {
                const dataToValidate = target === "body" ? req.body : target === "query" ? req.query : req.params

                if (schema instanceof yup.Schema) {

                    await schema.validate(dataToValidate, options as yup.ValidateOptions);

                } else if (schema instanceof ZodSchema) {

                    await schema.parseAsync(dataToValidate, options as z.ParseParams);

                } else if (joi.isSchema(schema)) {

                    const { error } = schema.validate(dataToValidate, options as joi.ValidationOptions);

                    if (error) throw error;

                } else {
                    throw new Error("Unsupported validation schema");
                }

                return next();
            } catch (error) {
                // logger.debug(error);
                let errorMessage;

                if (error instanceof yup.ValidationError) {
                    errorMessage = error.errors
                } else if (error instanceof joi.ValidationError) {
                    errorMessage = error.details.map(element => `${element.message} | path: ${element.path.join(", ")}`);
                } else if (error instanceof z.ZodError) {
                    errorMessage = error.issues.map(element => `${element.message} | path: ${element.path.join(", ")}`);
                } else {
                    try {
                        if (error instanceof Error) {
                            errorMessage = JSON.parse(error.message);
                        }
                    } catch (e) {
                        if (error instanceof Error) {
                            errorMessage = error.message
                        }
                    }
                }

                return res.status(400).body({
                    message: "Validation error",
                    errors: error instanceof Error ? errorMessage : "Unknown validation error"
                });
            }
        }
    }
}