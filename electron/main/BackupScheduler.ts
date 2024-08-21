import { Job, scheduleJob } from "node-schedule";
import {
  readdirSync,
  ensureDirSync,
  unlinkSync,
  statSync,
  Stats,
} from "fs-extra";
import { Server } from "./Server";
import { ConfigUtil } from "./ConfigUtil";

export class BackupScheduler {
  private prefix = "auto-";
  private job: Job | null = null;

  constructor(private server: Server) {
    this.init();
  }

  private init() {
    this.server.addEventListener(
      "calendarChanged",
      this.onCalendarChanged.bind(this)
    );

    ConfigUtil.addEventListener("change", this.onConfigChanged.bind(this));
  }

  private createJob() {
    const config = ConfigUtil.getConfig();

    if (config.periodicBackup.enabled && this.server.isCalendarRunning) {
      this.job = scheduleJob(config.periodicBackup.rule, async () => {
        const newBackupName = await this.server.generateBackup(this.prefix);

        console.log(`Backup created - ${newBackupName}`);
        console.log(`Next backup: ${this.job.nextInvocation()}`);

        this.removeAutoBackupsExceedingMaxBufferSize(
          config.periodicBackup.maxBufferSizeInGb
        );
      });

      console.log(`Scheduled backup job to ${config.periodicBackup.rule}`);
      console.log(`Next backup: ${this.job.nextInvocation()}`);
    }
  }

  private removeAutoBackupsExceedingMaxBufferSize(maxSizeInGb: number) {
    const serverDataPath = ConfigUtil.get("serverDataPath");

    if (!serverDataPath) return;

    const backupsFolder = `${serverDataPath}/Backups`;

    ensureDirSync(backupsFolder);

    const existingAutoBackups = readdirSync(backupsFolder).filter((file) =>
      file.startsWith(this.prefix)
    );

    const backupStats = existingAutoBackups.reduce<Record<string, Stats>>(
      (acc, file) => {
        const stats = statSync(`${backupsFolder}/${file}`);

        acc[file] = stats;

        return acc;
      },
      {}
    );

    const totalSizeInBytes = Object.values(backupStats).reduce(
      (acc, stat) => acc + stat.size,
      0
    );

    const maxSizeInBytes = maxSizeInGb * 1024 * 1024 * 1024;

    console.log(`Total size of backups: ${totalSizeInBytes / 1024 / 1024} MB`);
    console.log(`Max size allowed: ${maxSizeInBytes / 1024 / 1024} MB`);

    if (totalSizeInBytes > maxSizeInBytes) {
      console.log(
        `Total size of backups: ${totalSizeInBytes / 1024 / 1024} MB`
      );
      console.log(`Max size allowed: ${maxSizeInBytes / 1024 / 1024} MB`);

      const sortedFiles = Object.entries(backupStats)
        .sort(([, stat1], [, stat2]) => stat1.size - stat2.size)
        .sort(
          ([, stat1], [, stat2]) =>
            new Date(stat1.mtime).getTime() - new Date(stat2.mtime).getTime()
        );

      if (sortedFiles.length <= 1) {
        console.log("No backups to remove");

        return;
      }

      let removedSize = 0;

      while (
        removedSize < totalSizeInBytes - maxSizeInBytes &&
        sortedFiles.length > 1
      ) {
        const [file, stat] = sortedFiles.shift();

        removedSize += stat.size;

        console.log(`Removing backup: ${file}`);

        unlinkSync(`${backupsFolder}/${file}`);
      }

      console.log(
        `Removed backups to free up space: ${removedSize / 1024 / 1024} MB`
      );
    }
  }

  private rescheduleJob() {
    const rule = ConfigUtil.get("periodicBackup")?.rule;

    if (rule) {
      this.job.reschedule(rule);

      console.log(`Rescheduled backup job to ${rule}`);
      console.log(`Next backup: ${this.job.nextInvocation()}`);
    }
  }

  private cancelJob() {
    if (this.job) {
      this.job.cancel();
      this.job = null;

      console.log("Canceled backup job");
    }
  }

  private onCalendarChanged(isRunning: boolean) {
    if (isRunning && !this.job) {
      this.createJob();
    } else {
      this.cancelJob();
    }
  }

  onConfigChanged() {
    const newConfig = ConfigUtil.get("periodicBackup");

    if (!newConfig || !newConfig.enabled || !this.server.isCalendarRunning) {
      this.cancelJob();

      return;
    }

    this.removeAutoBackupsExceedingMaxBufferSize(newConfig.maxBufferSizeInGb);

    if (this.job) {
      this.rescheduleJob();

      return;
    } else {
      this.createJob();
    }
  }
}
