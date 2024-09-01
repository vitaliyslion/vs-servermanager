import { ipcMain } from "electron";
import { Server } from "./Server";
import { ConfigUtil } from "./ConfigUtil";
import { Dotnet } from "./Dotnet";
import packageJson from "../../package.json";

export const establishIpcConnection = (server: Server) => {
  ipcMain.handle("start", async () => {
    server.start();
  });

  ipcMain.handle("stop", async () => {
    server.stop();
  });

  ipcMain.handle("getConfig", async () => {
    return ConfigUtil.getConfig();
  });

  ipcMain.handle("saveConfig", async (_, config) => {
    ConfigUtil.saveConfig(config);
  });

  ipcMain.handle("initiateDllPathDialog", () =>
    ConfigUtil.initiateDllPathDialog()
  );

  ipcMain.handle("initiateDataPathDialog", () =>
    ConfigUtil.initiateDataPathDialog()
  );

  ipcMain.handle("sendCommand", async (_, command) => {
    server.sendCommand(command);
  });

  ipcMain.handle("verifyDotnetInstalled", async () => !!Dotnet.find());

  ipcMain.handle("selectDotnetPath", async () =>
    ConfigUtil.initiateDotnetPathDialog()
  );

  ipcMain.handle("installDotnet", async () => {
    await Dotnet.install();
  });

  ipcMain.handle("generateBackup", async () => server.generateBackup());

  ipcMain.handle("getAppInfo", async () => {
    return { version: packageJson.version };
  });
};
