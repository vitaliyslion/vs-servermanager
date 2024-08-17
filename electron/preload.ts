import { contextBridge, ipcRenderer } from "electron";

const api: Window["api"] = {
  start: () => ipcRenderer.invoke("start"),
  stop: () => ipcRenderer.invoke("stop"),
  onLog: (callback) => {
    const logCb = (_: Electron.IpcRendererEvent, message: string) =>
      callback(message);

    ipcRenderer.on("server:stdout", logCb);
    ipcRenderer.on("server:stderr", logCb);

    return () => {
      ipcRenderer.off("server:stdout", logCb);
      ipcRenderer.off("server:stderr", logCb);
    };
  },
  onClose: (callback) => {
    const closeCb = () => callback();

    ipcRenderer.on("server:close", closeCb);

    return () => {
      ipcRenderer.off("server:close", closeCb);
    };
  },
  getConfig: () => ipcRenderer.invoke("getConfig"),
  saveConfig: (config) => ipcRenderer.invoke("saveConfig", config),
  initiateDllPathDialog: () => ipcRenderer.invoke("initiateDllPathDialog"),
  initiateDataPathDialog: () => ipcRenderer.invoke("initiateDataPathDialog"),
  sendCommand: (command) => ipcRenderer.invoke("sendCommand", command),
  verifyDotnetInstalled: () => ipcRenderer.invoke("verifyDotnetInstalled"),
  selectDotnetPath: async () => {
    try {
      return ipcRenderer.invoke("selectDotnetPath");
    } catch (error) {
      console.error(error);
    }
  },
  installDotnet: () => ipcRenderer.invoke("installDotnet"),
};

contextBridge.exposeInMainWorld("api", api);
