/// <reference path="./verror.d.ts" />
/// <reference path="./ErrorInterfaces.d.ts" />
/// <reference path="./DatabaseError.d.ts" />
/// <reference path="./ValidationError.d.ts" />
/// <reference path="./ApplicationError.d.ts" />

declare class MyKoopError extends VErrorTypes.VError {
    public static DatabaseError: typeof DatabaseError;
    public static ApplicationError: typeof ApplicationError;
    public statusCode: number;
    public context: string;
    constructor(err: Error, msg?: string, ...args: any[]);
    serialize(): ErrorInterfaces.SerializeResult;
}
