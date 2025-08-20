import * as yup from 'yup';
import joi from 'joi';

// Currently the default zod is zod v4 and also we used import of zod/v3 to support version 3 for old users
import * as z from "zod";
import * as z3 from 'zod/v3';

import { Middleware } from '../../types/Router';

import type {
  ValidationConfig,
  ValidationSchema,
  ValidationTargets,
} from '../../types/Validator';

export class AxonValidator {
  static validate(
    schema: ValidationSchema,
    options?: ValidationConfig,
    target: ValidationTargets = 'body'
  ): Middleware {
    return async (req, res, next) => {
      try {
        const dataToValidate =
          target === 'body' ? req.body : target === 'query' ? req.query : req.params;

        if (schema instanceof yup.Schema) {
          await schema.validate(dataToValidate, options as yup.ValidateOptions);
        } else if (schema instanceof z3.ZodSchema || schema instanceof z3.ZodType || schema instanceof z.ZodType) {
          if ("_zod" in schema) {
            await schema.parseAsync(dataToValidate, options);
          } else {
            await schema.parseAsync(dataToValidate, options as z3.ParseParams);
          }
        } else if (joi.isSchema(schema)) {
          const { error } = schema.validate(dataToValidate, options as joi.ValidationOptions);

          if (error) throw error;
        } else {
          throw new Error('Unsupported validation schema');
        }

        return next();
      } catch (error) {
        // logger.debug(error);
        let errorMessage;

        if (error instanceof yup.ValidationError) {
          errorMessage = error.errors;
        } else if (error instanceof joi.ValidationError) {
          errorMessage = error.details.map(
            element => { return { message: element.message, path: element.path } }
          );
        } else if (error instanceof z3.ZodError || error instanceof z.ZodError) {
          errorMessage = error.issues.map(
            element => { return { message: element.message, path: element.path } }
          );
        } else {
          try {
            if (error instanceof Error) {
              errorMessage = JSON.parse(error.message);
            }
          } catch (e) {
            if (error instanceof Error) {
              errorMessage = error.message;
            }
          }
        }

        return res.status(400).body({
          message: 'Validation error',
          errors: error instanceof Error ? errorMessage : 'Unknown validation error',
        });
      }
    };
  }
}
