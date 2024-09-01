import { Channel, parseMessage } from "@/lib/parseMessage";

export interface WatchParams {
  start: {
    channel: Channel;
    message: string;
  };
  end: {
    channel: Channel;
    message: string;
  };
  trigger: () => void;
}

export class LogsHandler {
  private logsSubscribers: ((message: string) => void)[] = [];

  private subscribeToLogs(callback: (message: string) => void) {
    this.logsSubscribers.push(callback);

    return () => {
      this.logsSubscribers = this.logsSubscribers.filter(
        (subscriber) => subscriber !== callback
      );
    };
  }

  pushLog(message: string) {
    this.logsSubscribers.forEach((subscriber) => subscriber(message));
  }

  watch({ start, end, trigger }: WatchParams) {
    return new Promise<void>((resolve, reject) => {
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
          reject("Failed to finish");
        }, 1000 * 60 * 5);
      };

      const onFinished = () => {
        cleanup();
        resolve();
      };

      notStartedTimeout = setTimeout(() => {
        if (!isStarted) {
          cleanup();
          reject("Failed to start");
        }
      }, 1000 * 30);

      unsubscribeFromLogs = this.subscribeToLogs((message) => {
        const { channel, message: parsedMessage } = parseMessage(message);

        if (channel === start.channel && parsedMessage === start.message) {
          onStarted();
        }

        if (channel === end.channel && parsedMessage === end.message) {
          onFinished();
        }
      });

      trigger();
    });
  }

  permanentWatch({
    channel,
    message,
    callback,
  }: {
    channel: Channel;
    message: string;
    callback: () => void;
  }) {
    return this.subscribeToLogs((logMessage) => {
      const { channel: logChannel, message: parsedMessage } =
        parseMessage(logMessage);

      if (logChannel === channel && parsedMessage === message) {
        callback();
      }
    });
  }

  once({
    channel,
    message,
    callback,
  }: {
    channel: Channel;
    message: string;
    callback: () => void;
  }) {
    const unsubscribe = this.subscribeToLogs((logMessage) => {
      const { channel: logChannel, message: parsedMessage } =
        parseMessage(logMessage);

      if (logChannel === channel && parsedMessage === message) {
        callback();
        unsubscribe();
      }
    });
  }
}
