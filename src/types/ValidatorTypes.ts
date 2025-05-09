import * as yup from "yup";
import joi from "joi";
import { ZodSchema, z } from "zod";

export type ValidationSchema = joi.Schema | ZodSchema | yup.Schema;
export type ValidationConfig = joi.ValidationOptions | z.ParseParams | yup.ValidateOptions;
export type ValidationTargets = "body" | "query" | "params"