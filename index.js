var Module = (function () {
    function Module() {
    }
    Module.prototype.init = function (moduleManager) {
        this.moduleManager = moduleManager;
        //app.get("")
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
