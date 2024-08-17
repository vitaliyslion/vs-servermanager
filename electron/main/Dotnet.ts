import { sync } from "which";
import path from "path";
import fs from "fs-extra";
import os from "os";
import { spawn } from "child_process";

export class Dotnet {
  static find() {
    for (const dotnet of sync("dotnet", {
      all: true,
      nothrow: true,
    }) || []) {
      return dotnet;
    }

    if (process.platform === "win32") {
      // %LOCALAPPDATA%\Microsoft\dotnet\dotnet.exe
      const localappdata = process.env.LOCALAPPDATA;
      const localappdataExe = path.join(
        localappdata,
        "Microsoft",
        "dotnet",
        "dotnet.exe"
      );

      if (fs.existsSync(localappdataExe)) return localappdataExe;
    } else {
      // ~/.dotnet/dotnet
      const homedir = os.homedir();
      const dotnetHome = path.join(homedir, ".dotnet");
      const dotnetHomeExe = path.join(dotnetHome, "dotnet");

      if (fs.existsSync(dotnetHomeExe)) return dotnetHomeExe;
    }
  }

  static install() {
    // https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-install-script
    return new Promise<void>((resolve, reject) => {
      const handleExit = (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error("Failed to install .NET"));
        }
      };

      if (process.platform === "win32") {
        const ps = spawn("powershell.exe", [
          "-NoProfile",
          "-ExecutionPolicy",
          "unrestricted",
          "-Command",
          "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; &([scriptblock]::Create((Invoke-WebRequest -UseBasicParsing 'https://dot.net/v1/dotnet-install.ps1')))",
        ]);
        ps.stdout.on("data", (data) => console.log(data.toString()));
        ps.stderr.on("data", (data) => console.error(data.toString()));
        ps.on("exit", handleExit);
        ps.stdin.end();
      } else {
        const bash = spawn("bash", [
          "-c",
          "curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin",
        ]);
        bash.stdout.on("data", (data) => console.log(data.toString()));
        bash.stderr.on("data", (data) => console.error(data.toString()));
        bash.on("exit", handleExit);
        bash.stdin.end();
      }
    });
  }

  static validateExecutable(path: string) {
    return new Promise<void>((resolve, reject) => {
      const dotnet = spawn(path, ["--version"]);

      setTimeout(() => {
        if (!dotnet.killed) {
          dotnet.kill();
          reject(new Error("Timeout"));
        }
      }, 3000);

      dotnet.stdout.on("data", (message) => {
        const versionPattern = /^(\d+)\.\d+\.\d+$/;
        const version = message.toString().trim();
        const match = version.match(versionPattern);

        if (match) {
          const majorVersion = parseInt(match[1], 10);
          if (majorVersion >= 7) {
            resolve();
          } else {
            reject(new Error("Invalid .NET version"));
          }
        } else {
          reject(new Error("Invalid output from executable"));
        }

        if (!dotnet.killed) {
          dotnet.kill();
        }
      });

      dotnet.on("close", (code) => {
        if (code !== 0) {
          reject(new Error("Executable exited with non-zero code"));
        }
      });
    });
  }
}
