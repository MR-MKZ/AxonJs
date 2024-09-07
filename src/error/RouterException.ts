import { ExceptionMeta, RouterExceptionError } from "../types";

class RouterException extends Error {
    public name: string;
    private meta: ExceptionMeta;

    constructor(error: RouterExceptionError) {
        super(error.msg)
        this.name = error.name
        this.meta = error.meta
    }
}

export default RouterException;