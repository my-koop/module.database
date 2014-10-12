/// <reference path="typings/tsd.d.ts" />
import mykoop = require("mykoop");

class Module implements mykoop.IModule {
  moduleManager: mykoop.ModuleManager;

  init(moduleManager: mykoop.ModuleManager){
    this.moduleManager = moduleManager;
    //app.get("")
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

