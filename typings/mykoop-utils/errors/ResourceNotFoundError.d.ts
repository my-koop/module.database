/// <reference path="./ErrorInterfaces.d.ts" />
/// <reference path="./ApplicationError.d.ts" />
declare class ResourceNotFoundError extends ApplicationError {
    constructor(err: Error, data: any, msg?: string, ...args: any[]);
}
