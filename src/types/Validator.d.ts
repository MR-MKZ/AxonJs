import * as yup from 'yup';
import joi from 'joi';
import * as z3 from 'zod/v3';
import * as z4 from 'zod/v4';

export type ValidationSchema = joi.Schema | z3.ZodSchema | z4.ZodType | yup.Schema;
export type ValidationConfig = joi.ValidationOptions | z.ParseParams | yup.ValidateOptions;
export type ValidationTargets = 'body' | 'query' | 'params';
