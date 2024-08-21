import { app, dialog } from "electron";
import { existsSync, readJSONSync, writeFileSync } from "fs-extra";
import { isWindows } from "./os";
import { Dotnet } from "./Dotnet";

export interface Config {
  serverDllPath?: string;
  serverDataPath?: string;
  port?: number;
  dotnetPath?: string;

  periodicBackup?: {
    enabled: boolean;
    rule?: string;
    maxBufferSizeInGb?: number;
  };
}

export class ConfigUtil {
  private static config: Config | null = null;

  private static changeListeners: Array<(config: Config) => void> = [];

  private static get configPath() {
    return `${app.getPath("userData")}/config.json`;
  }

  private static load() {
    if (existsSync(this.configPath)) {
      this.config = readJSONSync(this.configPath);
    } else {
      this.config = {};
    }
  }

  private static save() {
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  static get<K extends keyof Config>(key: K) {
    if (!this.config) {
      this.load();
    }

    return this.config[key];
  }

  static set<K extends keyof Config>(key: K, value: Config[K]) {
    if (!this.config) {
      this.load();
    }

    this.config[key] = value;

    this.save();
  }

  static getConfig() {
    if (!this.config) {
      this.load();
    }

    return this.config;
  }

  static saveConfig(config: Partial<Config>) {
    this.config = {
      ...(this.config || {}),
      ...config,
    };

    console.log("Saving config", this.config);

    this.changeListeners.forEach((listener) => listener(this.config));
    this.save();
  }

  static addEventListener(event: "change", listener: (config: Config) => void) {
    if (event === "change") {
      this.changeListeners.push(listener);
    }
  }

  static async initiateDllPathDialog() {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "DLL", extensions: ["dll"] }],
    });

    if (!result.canceled) {
      return result.filePaths[0];
    }

    return undefined;
  }

  static async initiateDataPathDialog() {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (!result.canceled) {
      return result.filePaths[0];
    }

    return undefined;
  }

  static async initiateDotnetPathDialog() {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        isWindows
          ? { name: "EXE", extensions: ["exe"] }
          : { name: "All Files", extensions: ["*"] },
      ],
    });

    if (result.canceled) return undefined;

    const path = result.filePaths[0];

    await Dotnet.validateExecutable(path);

    this.set("dotnetPath", path);

    return path;
  }
}
