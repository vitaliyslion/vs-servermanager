interface Window {
  Config: import("../electron/main/ConfigUtil").Config;

  api: {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    onLog: (callback: (message: string) => void) => () => void;
    onClose: (callback: () => void) => () => void;
    getConfig: () => Promise<Window["Config"]>;
    saveConfig: (config: Window["Config"]) => Promise<void>;
    initiateDllPathDialog: () => Promise<string | undefined>;
    initiateDataPathDialog: () => Promise<string | undefined>;
    sendCommand: (command: string) => Promise<void>;
    verifyDotnetInstalled: () => Promise<boolean>;
    selectDotnetPath: () => Promise<string | undefined>;
    installDotnet: () => Promise<void>;
  };
}
