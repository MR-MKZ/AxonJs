const isAsync = (obj: any): obj is Promise<any> => {
    return obj != null && typeof obj.then === 'function';
}

export {
    isAsync
}