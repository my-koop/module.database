var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="typings/tsd.d.ts" />
var mysql = require("mysql");
var utils = require("mykoop-utils");

var CONNECTION_LIMIT_DEFAULT = 1;

var Module = (function (_super) {
    __extends(Module, _super);
    function Module() {
        _super.apply(this, arguments);
        this.pool = null;
    }
    Module.prototype.init = function () {
        var connectionInfo;
        try  {
            connectionInfo = require("dbConfig.json5");
            if (!connectionInfo.connectionLimit) {
                connectionInfo.connectionLimit = CONNECTION_LIMIT_DEFAULT;
            }
            this.connect(connectionInfo);
        } catch (e) {
            console.error("Unable to find Database configuration [dbConfig.json5]", e);
        }
    };

    Module.prototype.getConnection = function (callback) {
        var self = this;
        var stack = utils.__DEV__ ? new Error().stack : null;

        if (self.pool) {
            self.pool.getConnection(function (err, connection) {
                var connectionReleased = false;

                // In dev, making sure the connection is released
                if (utils.__DEV__ && !err) {
                    setTimeout(function () {
                        if (!connectionReleased) {
                            console.warn("A connection was requested but still not released\n", stack);
                            connection.release();
                        }
                    }, 10000);
                }
                callback(err, connection, function () {
                    connectionReleased = true;
                    if (!err)
                        connection.release();
                });
            });
            return;
        }
        callback(new Error("connection unavailable"), null, function () {
        });
    };

    Module.prototype.connect = function (dbConfig) {
        if (!dbConfig) {
            console.error("Database connection config are required");
            return;
        }

        this.dbConfig = dbConfig;
        this.pool = mysql.createPool(this.dbConfig);
        this.pool.on("connection", function (connection) {
            console.log("New connection created ", connection.threadId);
            connection.on("error", function (err) {
                if (err.fatal) {
                    console.log("Fatal error on connection ", connection.threadId, err);
                }
            });
        });
        this.pool.on("error", function (err) {
            console.log("DB error", err);
        });
    };
    return Module;
})(utils.BaseModule);

var ModuleBridge = (function () {
    function ModuleBridge() {
    }
    ModuleBridge.prototype.getInstance = function () {
        return this.instance || (this.instance = new Module());
    };

    ModuleBridge.prototype.onAllModulesInitialized = function (moduleManager) {
        this.getInstance().init();
    };

    ModuleBridge.prototype.getModule = function () {
        return this.getInstance();
    };
    return ModuleBridge;
})();

var bridge = new ModuleBridge();
module.exports = bridge;
