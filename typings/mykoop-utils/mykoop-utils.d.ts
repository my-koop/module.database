/// <reference path="errors/MyKoopError.d.ts" />

declare module mklogger {
  export interface Logger {}
}

declare module mysql {
  export interface IConnection {}
}

declare module "mykoop-utils/common" {
  export function validation(obj: any, constraint, options?: any);
  module validation {
    export function addValidator(
      validatorName: string,
      validationFunction: (value, options?: any, key?: string, attributes?: any) => string
    );
  }
}

declare module "mykoop-utils" {

  export var __DEV__: boolean;
  export var __PROD__: boolean;
  export function getLogger(module: any): mklogger.Logger;
  export class errors extends MyKoopError{}

  export class BaseModule implements mykoop.IModule {
    getModuleManager(): mykoop.ModuleManager;
    setModuleManager(moduleManager: mykoop.ModuleManager): void;
    callWithConnection(
      method: string,
      params: any,
      callback: (err, result?) => void
    );
    callWithConnection<P,C>(
      method: (connection, params: P, callback: C) => void,
      params: P,
      callback: C
    );
  }

  export class ModuleControllersBinder<T extends mykoop.IModule> {
    public moduleInstance: T;
    constructor(moduleInstance: T);
    attach(
      params: mykoop.RouteParams,
      controller: Express.Handler
    );
    attach(
      params: mykoop.RouteParams,
      controller: Express.Handler[]
    );

    makeSimpleController<P,R>(
      method: (params: P, callback: (err?, res?: R) => void) => void,
      options: {
        parseFunc?: (req: Express.Request) => P
        processResponse?: (response: R) => any;
      }
    ): (req: Express.Request, res: Express.Response) => void;
    makeSimpleController<R>(
      method: (params: any, callback: (err?, res?: R) => void) => void,
      options: {
        processResponse?: (response: R) => any;
      }
    ): (req: Express.Request, res: Express.Response) => void;
    makeSimpleController<P>(
      method: (params: P, callback: (err?, res?) => void) => void,
      options: {
        parseFunc?: (req: Express.Request) => P
      }
    ): (req: Express.Request, res: Express.Response) => void;
    makeSimpleController<P>(
      method: (params: P, callback: (err?, res?) => void) => void,
      parseFunc?: (req: Express.Request) => P
    ): (req: Express.Request, res: Express.Response) => void;
    makeSimpleController(
      methodName: string,
      parseFunc?: (req: Express.Request) => any
    ): (req: Express.Request, res: Express.Response) => void;
    makeSimpleController(
      methodName: string,
      options?: {
        parseFunc?: (req: Express.Request) => any
        processResponse?: (response: any) => any;
      }
    ): (req: Express.Request, res: Express.Response) => void;
  }

  export interface RouteMetaData {
    // path of the route, mustn't be empty
    // ie: ["admin","inventory","description"]
    // where description is the handler you want to add
    idPath: string[];
    // Path to reach this handler in browser, can be relative or absolute
    path?: string;
    // Name of the route for <Link to="...">, set to null to use last idPath element
    name?: string;
    // Component you want to use for this route, the module must own the component
    // Wrapper component default is set
    // Wrapper components have {this.props.activeRouteHandler()}
    component?: string;
    // Permissions the user needs to meet for this route
    // to be displayed.
    permissions?: any;
    // same as component but used when this route has wrapper component
    default?: string;
  }

  export class MetaDataBuilder {
    // Retrieves the MetaData object
    get(): any;
    // Adds data to the MetaData, must at least provide the root in path
    addData(path: string[], data: any): void;
    addData(path: string, data: any): void;
    // Adds a frontend route to the MetaData, refer to RouteMetaData for options
    addFrontendRoute(options: RouteMetaData);
  }

  export class MySqlHelper {
    constructor();
    connection(): mysql.IConnection;
    setConnection(cleanup: any, connection: any): void;
    beginTransaction(callback: any): void;
    commitTransaction(callback: any): void;
    cleanup(err?: any, callback?: any): void;
  }
}
