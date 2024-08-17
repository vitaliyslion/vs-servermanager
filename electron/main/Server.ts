import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Dotnet } from "./Dotnet";
import { ConfigUtil } from "./ConfigUtil";
import { ValidationError, ValidationIssue } from "@/errors/ValidatorError";

export class Server {
  private process: ChildProcessWithoutNullStreams | null = null;

  constructor(private webContents: Electron.WebContents) {}

  validate() {
    const issues: ValidationIssue[] = [];

    if (!Dotnet.find()) {
      issues.push(ValidationIssue.DotnetNotFound);
    }

    if (!ConfigUtil.get("serverDllPath")) {
      issues.push(ValidationIssue.ServerDllPathNotFound);
    }

    if (!ConfigUtil.get("serverDataPath")) {
      issues.push(ValidationIssue.ServerDataPathNotFound);
    }

    return issues;
  }

  start() {
    if (this.process) {
      throw new Error("Already running");
    }

    const validationIssues = this.validate();

    if (validationIssues.length) {
      throw new ValidationError(validationIssues);
    }

    const port = ConfigUtil.get("port") || 42420;
    const dotnet = ConfigUtil.get("dotnetPath") || Dotnet.find();

    this.process = spawn(dotnet, [
      ConfigUtil.get("serverDllPath"),
      "--dataPath",
      ConfigUtil.get("serverDataPath"),
      "--port",
      port.toString(),
    ]);

    this.process.stdout.on("data", (data) => {
      this.webContents.send("server:stdout", data.toString());
    });

    this.process.stderr.on("data", (data) => {
      console.error(data.toString());

      this.webContents.send("server:stderr", data.toString());
    });

    const handleClose = (code: number) => {
      this.webContents.send("server:close", code);
      this.process = null;
    };

    this.process.on("close", handleClose);
    this.process.on("exit", handleClose);
  }

  stop() {
    return new Promise<void>((resolve, reject) => {
      if (this.process) {
        this.sendCommand("/stop");

        this.process.once("close", () => {
          this.process = null;
          resolve();
        });
      } else {
        reject("Not running");
      }
    });
  }

  sendCommand(command: string) {
    if (this.process) {
      this.process.stdin.write(command + "\r\n");
    }
  }
}
