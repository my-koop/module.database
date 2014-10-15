/// <reference path="typings/tsd.d.ts" />
var mysql = require("mysql");

var Module = (function () {
    function Module() {
    }
    Module.prototype.init = function (moduleManager) {
        this.moduleManager = moduleManager;

        //app.get("")
        var connectionInfo;
        try  {
            connectionInfo = require("dbConfig.json5");
            this.connect(connectionInfo);
        } catch (e) {
            console.error("Unable to find Database configuration [dbConfig.json5]", e);
        }
    };

    Module.prototype.getConnection = function (callback) {
        var self = this;

        // async call
        setTimeout(function () {
            if (self.connection) {
                callback(null, self.connection);
                return;
            }
            callback("connection unavailable", null);
        }, 0);
    };

    Module.prototype.connect = function (dbConfig) {
        if (!dbConfig) {
            console.error("Database connection config are required");
            return;
        }

        this.dbConfig = dbConfig;
        return this.createConnection();
    };

    /**
    * Handling connection disconnects, as defined here: https://github.com/felixge/node-mysql
    */
    Module.prototype.createConnection = function () {
        if (!this.dbConfig)
            return;
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
    };
    return Module;
})();

var ModuleBridge = (function () {
    function ModuleBridge() {
    }
    ModuleBridge.prototype.getInstance = function () {
        return this.instance || (this.instance = new Module());
    };

    ModuleBridge.prototype.onAllModulesInitialized = function (moduleManager) {
        console.log("Hey hey im the database and im ready to rumble");
        this.getInstance().init(moduleManager);
    };

    ModuleBridge.prototype.getModule = function () {
        return this.getInstance();
    };

    ModuleBridge.prototype.getStyles = function () {
        return null;
    };

    ModuleBridge.prototype.getReactComponents = function () {
        return null;
    };
    return ModuleBridge;
})();

var bridge = new ModuleBridge();
module.exports = bridge;
