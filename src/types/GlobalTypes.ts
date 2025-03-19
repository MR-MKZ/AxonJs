import { Headers } from "..";

export interface JsonResponse {
    body: object;
    headers?: Headers;
    responseCode: number;
    responseMessage?: string;
}
export interface ExceptionMeta {
    type: string;
    description: string;
}

export interface RouterExceptionError {
    msg: string;
    name: string;
    meta: ExceptionMeta
}