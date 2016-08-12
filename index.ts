/// <reference path="typings/tsd.d.ts" />
import mysql = require("mysql");
import utils = require("mykoop-utils");
var parse = require('node-query').parse;
var logger = utils.getLogger(module);

var CONNECTION_LIMIT_DEFAULT = 4;

var nextId = 1;
var memoryDB = {
  user: [{
    id: "admin",
    email: "admin@admin.com",
    firstname: "admin",
    lastname: "admin",
    // pwd: 123
    pwdhash: "g53JxtTbv8V7ez5W1s/KXoc38H+Z0GuiSoaFN0rsntRjYXw0pZxtK4x9IywssEX8JFP0sqTQxHs4qV39JqU/h9eQ30bNVpmAtP8NJD3RPIRpaVxC990dX9lHMg/WdZc9xehAF87lo1EBVUXwu8KPnYnUjiDyclaCMrJridfEE1Q=",
    salt: "scd5PuSkWVl6E1xpR/8vsBjd3NZroEUuwzZnpoPr278ZzR+w5KF6DmE8jokYdewQblvfSsLPKzUp0lyVH+TEKoxT+z/s2h654oVtXN14mBCpqef5JYsGuLohNohCsX97nqV31GdgSI0XD7dq1CVWe09U8nZdmfXr9QVcM5RB0Kw=",
    perms: JSON.stringify({
      "website": {
        "settings": true
      },
      "events": {
        "create": true,
        "view": true,
        "update": true,
        "delete": true,
        "control": true,
        "cancel": true,
        "register": true,
        "notes": {
          "view": true,
          "create": true
        },
        "users": {
          "view": true,
          "add": true,
          "remove": true
        }
      },
      "inventory": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true
      },
      "mailinglists": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true,
        "send": true,
        "users": {
          "view": true,
          "add": true,
          "remove": true
        }
      },
      "membership": {
        "view": true,
        "edit": true
      },
      "invoices": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true,
        "close": true,
        "reopen": true,
        "reports": true
      },
      "user": {
        "activation": true,
        "profile": {
          "view": true,
          "edit": true,
          "password": true,
          "permissions": {
            "view": true,
            "edit": true
          }
        },
        "notes": {
          "view": true,
          "create": true
        },
        "permissions": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true,
          "users": {
            "view": true,
            "add": true,
            "remove": true
          }
        }
      },
      "volunteering": {
        "hours": {
          "enter": true,
          "report": true
        }
      }
    })
  }]
};
function processInMemoryQuery(ast) {
  var rows: any = [];
  switch(ast.type) {
    case "select":
      var tableName = ast.from[0].table;
      var table = memoryDB[tableName];
      rows = [];
      if (table) {
        switch(ast.where.operator) {
          case "=":
            rows = table.filter(row => row[ast.where.left.column] == ast.where.right.value)
            break;
        }
      }
      return rows;

    case "insert":
      var tableName = ast.table;
      memoryDB[tableName] = memoryDB[tableName] || {};
      var table = memoryDB[tableName];
      var newElem = ast.set.reduce((newElem, col) => {
        newElem[col.column] = col.value.value;
        return newElem;
      }, {});
      var id = nextId++;
      newElem.id = id;
      table.push(newElem);
      rows = [newElem];
      rows.insertId = id;
      return rows;
    default:
      throw new Error("todo");
  }
}

function getInMemoryConnection(callback: mkdatabase.ConnectionCallback) {
  var connection: mysql.IConnection = {
    beginTransaction: function(){},
    changeUser: function(){},
    commit: function(){},
    config: null,
    connect: function() { },
    destroy: function() { },
    end: function() { },
    escape: mysql.escape,
    escapeId: function() { return ""; },
    format: mysql.format,
    on: function() { return connection; },
    pause: function() { },
    query: function(sql, values?, callback?) {
      if (!callback) {
        callback = values;
        values = undefined;
      }
      if (!callback) {
        callback = function(){}
      }
      try {
        var queryStr = mysql.format(sql, values);
        logger.info(queryStr);
        var ast = parse(queryStr);
        logger.info(ast);
        var res: any = processInMemoryQuery(ast);
        res.fieldCount = 0;
        res.affectedRows = res.length;
        res.message = "";
        res.serverStatus = 200;
        res.warningCount = 0;
        res.changedRows = res.changedRows || 0;
        //logger.info(JSON.stringify(res));
        callback(null, res);
      } catch (e) {
        callback(e);
      }
      return null;
    },
    release: function() { },
    resume: function() { },
    rollback: function() { },
    threadId: 0
  };
  callback(null, connection, function() { });
}

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
      // Ping the connection to see if it's alive at bootstrap
      this.getConnection(function(err, connection, cleanup) {
        if(err) {
          logger.error(err);
        }
        cleanup();
      });
    } catch(e) {
      logger.error("Unable to find Database configuration [dbConfig.json5]", e);
      logger.info("Fallback to in memory database");
      this.getConnection = getInMemoryConnection;
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
              logger.warn(
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
      logger.verbose("New connection created ", connection.threadId);
      connection.on("error", function(err) {
        if(err.fatal) {
          logger.verbose("Fatal error on connection ", connection.threadId, err);
        }
      });
    });
    this.pool.on("error", function(err) {
      logger.error("DB error", err);
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

