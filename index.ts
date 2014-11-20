/// <reference path="typings/tsd.d.ts" />
import mysql = require("mysql");
import utils = require("mykoop-utils");

var CONNECTION_LIMIT_DEFAULT = 4;

class Module extends utils.BaseModule implements mkdatabase.Module {
  pool: mysql.IPool = null;
  dbConfig: mysql.IConnectionConfig;

  init() {
    var connectionInfo;
    try{
      connectionInfo = require("dbConfig.json5");
      if(!connectionInfo.connectionLimit) {
        connectionInfo.connectionLimit = CONNECTION_LIMIT_DEFAULT;
      }
      this.connect(connectionInfo);
    } catch(e) {
      console.error("Unable to find Database configuration [dbConfig.json5]", e);
    }
  }

  getConnection(callback: mkdatabase.ConnectionCallback) {
    var self = this;
    var stack = utils.__DEV__ ? new Error().stack : null;

    if(self.pool) {
      self.pool.getConnection(function (err, connection) {
        var connectionReleased = false;

        // In dev, making sure the connection is released
        if(utils.__DEV__ && !err) {
          setTimeout(function() {
            if(!connectionReleased) {
              console.warn(
                "A connection was requested but still not released\n",
                stack
              );
              connectionReleased = true;
              connection.release();
            }
          }, 10000);
        }
        callback(err, connection, function() {
          if(connectionReleased) return;
          connectionReleased = true;
          if(!err) connection.release();
        });

      });
      return;
    }
    callback(new Error("connection unavailable"), null, function(){} );
  }

  connect(dbConfig: mysql.IConnectionConfig) {
    if(!dbConfig) {
      console.error("Database connection config are required");
      return;
    }

    this.dbConfig = dbConfig;
    this.pool = mysql.createPool(this.dbConfig);
    this.pool.on("connection", function(connection) {
      console.log("New connection created ", connection.threadId);
      connection.on("error", function(err) {
        if(err.fatal) {
          console.log("Fatal error on connection ", connection.threadId, err);
        }
      });
    });
    this.pool.on("error", function(err) {
      console.log("DB error", err);
    });
  }
}


class ModuleBridge implements mykoop.IModuleBridge {
  instance: Module;

  getInstance(): Module {
    return this.instance || (this.instance = new Module());
  }

  onAllModulesInitialized(moduleManager: mykoop.ModuleManager) {
    this.getInstance().init();
  }

  getModule() : mykoop.IModule {
    return this.getInstance();
  }
}

var bridge: mykoop.IModuleBridge = new ModuleBridge();
export = bridge;

