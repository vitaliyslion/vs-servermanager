import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Dotnet } from "./Dotnet";
import { ConfigUtil } from "./ConfigUtil";
import { ValidationError, ValidationIssue } from "@/errors/ValidatorError";
import { Channel } from "@/lib/parseMessage";
import { format } from "date-fns";
import { LogsHandler } from "./LogsHandler";
import { BackupScheduler } from "./BackupScheduler";

export class Server {
  private logsHandler: LogsHandler;
  private backupScheduler: BackupScheduler;
  private process: ChildProcessWithoutNullStreams | null = null;
  isCalendarRunning = false;
  private calendarListeners: ((isRunning: boolean) => void)[] = [];

  constructor(private webContents: Electron.WebContents) {
    this.logsHandler = new LogsHandler();
    this.backupScheduler = new BackupScheduler(this);

    this.watchCalendar();
  }

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

  private watchCalendar() {
    this.logsHandler.permanentWatch({
      channel: Channel.ServerNotification,
      message: "All clients disconnected, pausing game calendar.",
      callback: () => {
        this.isCalendarRunning = false;
        this.calendarListeners.forEach((listener) => listener(false));
      },
    });
    this.logsHandler.permanentWatch({
      channel: Channel.ServerNotification,
      message: "A client reconnected, resuming game calendar.",
      callback: () => {
        this.isCalendarRunning = true;
        this.calendarListeners.forEach((listener) => listener(true));
      },
    });
  }

  private cleanup() {
    this.process = null;
    this.isCalendarRunning = false;
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

      this.logsHandler.pushLog(message);
      this.webContents.send("server:stdout", message);
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

  sendCommand(command: string) {
    if (this.process) {
      this.process.stdin.write(command + "\r\n");
    }
  }

  async generateBackup(prefix = "") {
    const name = `${prefix}vssm-${format(
      new Date(),
      "yyyy-MM-dd_HH-mm-ss"
    )}.vcdbs`;

    await this.logsHandler.watch({
      start: {
        channel: Channel.ServerNotification,
        message: "Ok, generating backup, this might take a while",
      },
      end: {
        channel: Channel.ServerNotification,
        message: "Backup complete!",
      },
      trigger: () => {
        this.sendCommand(`/genbackup ${name}`);
      },
    });

    return name;
  }

  addEventListener(
    event: "calendarChanged",
    listener: (isRunning: boolean) => void
  ) {
    if (event === "calendarChanged") {
      this.calendarListeners.push(listener);
    }
  }

  removeEventListener(
    event: "calendarChanged",
    listener: (isRunning: boolean) => void
  ) {
    if (event === "calendarChanged") {
      this.calendarListeners = this.calendarListeners.filter(
        (l) => l !== listener
      );
    }
  }
}
