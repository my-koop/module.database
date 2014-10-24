// Type definitions for database v0.0.1
// Project: https://github.com/my-koop/service.website
// Definitions by: Michael Ferris <https://github.com/Cellule/>
// Definitions: https://github.com/my-koop/type.definitions

/// <reference path="../mykoop/mykoop.d.ts" />

declare module mysql {
  export interface IConnection{}
  export interface IConnectionConfig{}
}

declare module mykoop {
  export interface IModule{}
}

declare module mkdatabase {

  export interface ConnectionCallback{
    (err: any, connection: mysql.IConnection, doneCallback: () => void) : void;
  }

  export interface Module extends mykoop.IModule {
    getConnection(callback: ConnectionCallback): void;
  }

}

