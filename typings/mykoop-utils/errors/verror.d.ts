
declare module VErrorTypes {
  export class VError implements Error {
    message: string;
    name: string;
    toString(): string;
    cause(): string;
    stack: string;
  }

}

declare module "verror" {
  class VError extends VErrorTypes.VError {
    constructor(err: Error, msg: string, ...args: any[]);
  }
  module VError {
    export class WError extends VErrorTypes.VError {
      constructor(err: Error, msg: string, ...args: any[]);
    }
  }
  export = VError;
}
