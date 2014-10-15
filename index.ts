/// <reference path="typings/tsd.d.ts" />
import mysql = require("mysql");

class Module implements mkdatabase.Module {
  moduleManager: mykoop.ModuleManager;
  connection: mysql.IConnection;
  dbConfig: mysql.IConnectionConfig;

  init(moduleManager: mykoop.ModuleManager){
    this.moduleManager = moduleManager;
    //app.get("")
    var connectionInfo;
    try{
      connectionInfo = require("dbConfig.json5");
      this.connect(connectionInfo);
    } catch(e) {
      console.error("Unable to find Database configuration [dbConfig.json5]", e);
    }
  }

  getConnection(callback: mkdatabase.ConnectionCallback) {
    var self = this;
    // async call
    setTimeout(function(){
      if(self.connection){
        callback(null,self.connection);
        return;
      }
      callback("connection unavailable", null);
    },0);
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
    console.log("Hey hey im the database and im ready to rumble");
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

