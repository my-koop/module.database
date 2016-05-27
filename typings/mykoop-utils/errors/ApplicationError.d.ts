/// <reference path="./ErrorInterfaces.d.ts" />
/// <reference path="./MyKoopError.d.ts" />
/// <reference path="./ValidationError.d.ts" />
/// <reference path="./ResourceNotFoundError.d.ts" />
/// <reference path="./AccessDeniedError.d.ts" />
declare class ApplicationError extends MyKoopError {
    errData: any;
    static ValidationError: typeof ValidationError;
    static ResourceNotFoundError: typeof ResourceNotFoundError;
    static AccessDeniedError: typeof AccessDeniedError;
    constructor(err: Error, errData?: any, msg?: string, ...args: any[]);
    serialize(): ErrorInterfaces.SerializeResult;
}
