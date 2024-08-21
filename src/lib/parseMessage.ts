export enum Channel {
  ServerEvent = "Server Event",
  ServerNotification = "Server Notification",
  ServerChat = "Server Chat",
}

export interface ParsedMessage {
  datetime: string;
  channel: Channel;
  message: string;
}

export const parseMessage = (message: string): ParsedMessage | null => {
  const regex = /(\d{1,2}\.\d{1,2}\.\d{4} \d{2}:\d{2}:\d{2}) \[(.*?)\] (.*)/;
  const match = message.match(regex);

  if (match) {
    const [, datetime, channel, message] = match;

    return {
      datetime: datetime.trim(),
      channel: channel.trim() as Channel,
      message: message.trim(),
    };
  }

  return null;
};
