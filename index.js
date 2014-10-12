var mysql = require("mysql");

var Module = (function () {
    function Module() {
    }
    Module.prototype.init = function (moduleManager) {
        this.moduleManager = moduleManager;
        //app.get("")
    };

    Module.prototype.getConnection = function () {
        return this.connection;
    };

    Module.prototype.connect = function (dbConfig) {
        if (!dbConfig) {
            console.error("Database connection config are required");
            return;
        }

        this.dbConfig = dbConfig;
        this.createConnection();
    };

    /**
    * Handling connection disconnects, as defined here: https://github.com/felixge/node-mysql
    */
    Module.prototype.createConnection = function () {
        if (!this.dbConfig)
            return;

        this.connection = mysql.createConnection(this.dbConfig);

        this.connection.connect(function (err) {
            if (err) {
                console.log('error when connecting to db:', err);
                setTimeout(this.createConnection, 2000);
            }
        });

        this.connection.on('error', function (err) {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                this.createConnection();
            } else {
                throw err;
            }
        });
    };
    return Module;
})();

var ModuleBridge = (function () {
    function ModuleBridge() {
    }
    ModuleBridge.prototype.getInstance = function () {
        return this.instance || (this.instance = new Module());
    };

    ModuleBridge.prototype.onAllModulesLoaded = function (moduleManager) {
        console.log("Hey hey im the inventory and im ready to rumble");
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
