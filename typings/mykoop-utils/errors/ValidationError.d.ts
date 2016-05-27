/// <reference path="./ErrorInterfaces.d.ts" />
/// <reference path="./ApplicationError.d.ts" />
declare class ValidationError extends ApplicationError {
    validationErrorData: any;
    constructor(err: Error, validationErrorData: any, msg?: string, ...args: any[]);
}
