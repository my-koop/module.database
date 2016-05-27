/// <reference path="./ErrorInterfaces.d.ts" />
/// <reference path="./MyKoopError.d.ts" />
declare class DatabaseError extends MyKoopError {
    constructor(err: Error, msg?: string, ...args: any[]);
}
