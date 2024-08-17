import os from "os";

export const isWindows = os.platform() === "win32";
export const isMac = os.platform() === "darwin";
export const isLinux = os.platform() === "linux";
