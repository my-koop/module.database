/// <reference path="typings/tsd.d.ts" />
import mykoop = require("mykoop");
import mysql = require("mysql");
import mkdatabase = require("mykoop-database");

class Module implements mkdatabase {
  moduleManager: mykoop.ModuleManager;
  connection: mysql.IConnection;
  dbConfig: mysql.IConnectionConfig;

  init(moduleManager: mykoop.ModuleManager){
    this.moduleManager = moduleManager;
    //app.get("")
  }

  getConnection(): mysql.IConnection {
    return this.connection;
  }

  connect(dbConfig: mysql.IConnectionConfig): mysql.IConnection {
    if(!dbConfig) {
      console.error("Database connection config are required");
      return;
    }

    this.dbConfig = dbConfig;
    return this.createConnection();
  }

  /**
   * Handling connection disconnects, as defined here: https://github.com/felixge/node-mysql
   */
  private createConnection(): mysql.IConnection {
    if(!this.dbConfig) return;
    var self = this;
    this.connection = mysql.createConnection(this.dbConfig);

    this.connection.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(self.createConnection, 2000);
        }
    });

    this.connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            self.createConnection();
        } else {
            throw err;
        }
    });
    return this.connection;
  }
}


class ModuleBridge implements mykoop.IModuleBridge {
  instance: Module;

  getInstance(): Module {
    return this.instance || (this.instance = new Module());
  }

  onAllModulesLoaded(moduleManager: mykoop.ModuleManager) {
    console.log("Hey hey im the inventory and im ready to rumble");
    this.getInstance().init(moduleManager);
  }

  getModule() : mykoop.IModule {
    return this.getInstance();
  }

  getStyles(): string[] {
    return null;
  }

  getReactComponents(): string[] {
    return null;
  }
}

var bridge: mykoop.IModuleBridge = new ModuleBridge();
export = bridge;

