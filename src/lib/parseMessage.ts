export enum Channel {
  ServerEvent = "Server Event",
  ServerNotification = "Server Notification",
  ServerChat = "Server Chat",
}

export interface ParsedMessage {
  datetime: Date;
  channel: Channel;
  message: string;
}

export const parseMessage = (message: string): ParsedMessage | null => {
  const regexForMessage =
    /(\d{1,2}\.\d{1,2}\.\d{4} \d{2}:\d{2}:\d{2}) \[(.*?)\] (.*)/;
  const regexForDate = /(\d{1,2})\.(\d{1,2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})/;
  const messageMatch = message.match(regexForMessage);

  if (messageMatch) {
    const [, datetime, channel, message] = messageMatch;

    const dateMatch = datetime.match(regexForDate);

    if (dateMatch) {
      const [day, month, year, hours, minutes, seconds] = dateMatch
        .slice(1, 7)
        .map(Number);

      const datetime = new Date(year, month - 1, day, hours, minutes, seconds);

      return {
        datetime,
        channel: channel.trim() as Channel,
        message: message.trim(),
      };
    }
  }

  return null;
};
