import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Dotnet } from "./Dotnet";
import { ConfigUtil } from "./ConfigUtil";
import { ValidationError, ValidationIssue } from "@/errors/ValidatorError";
import { Channel, parseMessage } from "@/lib/parseMessage";
import { format } from "date-fns";

export class Server {
  private process: ChildProcessWithoutNullStreams | null = null;
  private isCalendarRunning = false;

  private logsSubscribers: ((message: string) => void)[] = [];

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

  private cleanup() {
    this.process = null;
    this.isCalendarRunning = false;
  }

  private processLogMessage(logMessage: string) {
    const { channel, message } = parseMessage(logMessage);

    if (
      channel === Channel.ServerNotification &&
      message === "All clients disconnected, pausing game calendar."
    ) {
      this.isCalendarRunning = false;
    }

    if (
      channel === Channel.ServerNotification &&
      message === "A client reconnected, resuming game calendar."
    ) {
      this.isCalendarRunning = true;
    }
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
      const message = data.toString();

      this.logsSubscribers.forEach((subscriber) => subscriber(message));
      this.webContents.send("server:stdout", message);

      this.processLogMessage(message);
    });

    this.process.stderr.on("data", (data) => {
      console.error(data.toString());

      this.webContents.send("server:stderr", data.toString());
    });

    const handleClose = (code: number) => {
      this.webContents.send("server:close", code);
      this.cleanup();
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

  private subscribeToLogs(callback: (message: string) => void) {
    this.logsSubscribers.push(callback);

    return () => {
      this.logsSubscribers = this.logsSubscribers.filter(
        (subscriber) => subscriber !== callback
      );
    };
  }

  sendCommand(command: string) {
    if (this.process) {
      this.process.stdin.write(command + "\r\n");
    }
  }

  generateBackup() {
    return new Promise<string>((resolve, reject) => {
      if (this.process) {
        const name = `vssm-${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.vcdbs`;
        let isStarted = false;
        let notStartedTimeout: NodeJS.Timeout | null = null;
        let notFinishedTimeout: NodeJS.Timeout | null = null;
        let unsubscribeFromLogs: () => void | null = null;

        const cleanup = () => {
          clearTimeout(notStartedTimeout);
          clearTimeout(notFinishedTimeout);
          unsubscribeFromLogs?.();
        };

        const onStarted = () => {
          isStarted = true;
          clearTimeout(notStartedTimeout);

          notFinishedTimeout = setTimeout(() => {
            cleanup();
            reject("Failed to finish backup");
          }, 1000 * 60 * 5);
        };

        const onFinished = () => {
          cleanup();
          resolve(name);
        };

        notStartedTimeout = setTimeout(() => {
          if (!isStarted) {
            cleanup();
            reject("Failed to start backup");
          }
        }, 1000 * 30);

        unsubscribeFromLogs = this.subscribeToLogs((message) => {
          const { channel, message: parsedMessage } = parseMessage(message);

          if (
            channel === Channel.ServerNotification &&
            parsedMessage === "Ok, generating backup, this might take a while"
          ) {
            onStarted();
          }

          if (
            channel === Channel.ServerNotification &&
            parsedMessage === "Backup complete!"
          ) {
            onFinished();
          }
        });

        this.sendCommand(`/genbackup ${name}`);
      } else {
        reject("Not running");
      }
    });
  }
}
