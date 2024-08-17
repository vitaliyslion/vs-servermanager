import React, { useMemo } from "react";
import { LogWindow } from "../LogWindow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";
import { Channel, parseMessage } from "@/lib/parseMessage";

export interface LogsOutputProps {
  className?: string;
  messages: string[];
}

enum LogTab {
  General = "general",
  ServerEvent = "serverEvent",
  ServerNotification = "serverNotification",
  ServerChat = "serverChat",
}

export const LogsOutput: React.FC<LogsOutputProps> = ({
  className,
  messages,
}) => {
  const { serverEvents, serverNotifications, serverChat } = useMemo(
    () =>
      messages.reduce<{
        serverEvents: string[];
        serverNotifications: string[];
        serverChat: string[];
      }>(
        (acc, message) => {
          const parsedMessage = parseMessage(message);

          if (parsedMessage) {
            const { channel } = parsedMessage;

            if (channel === Channel.ServerEvent) {
              acc.serverEvents.push(message);
            } else if (channel === Channel.ServerNotification) {
              acc.serverNotifications.push(message);
            } else if (channel === Channel.ServerChat) {
              acc.serverChat.push(message);
            }
          }

          return acc;
        },
        { serverEvents: [], serverNotifications: [], serverChat: [] }
      ),
    [messages]
  );

  const tabs = useMemo(
    () => [
      {
        id: LogTab.General,
        label: "General",
        data: messages,
      },
      {
        id: LogTab.ServerChat,
        label: "Chat",
        data: serverChat,
        stripChannel: true,
      },
      {
        id: LogTab.ServerEvent,
        label: "Events",
        data: serverEvents,
        stripChannel: true,
      },
      {
        id: LogTab.ServerNotification,
        label: "Notifications",
        data: serverNotifications,
        stripChannel: true,
      },
    ],
    [messages, serverEvents, serverNotifications, serverChat]
  );

  return (
    <Tabs
      defaultValue={LogTab.General}
      className={cn(className, "flex flex-col items-start")}
    >
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex-1 h-0 w-full pt-2">
        {tabs.map((tab) => (
          <TabsContent key={tab.id} className="h-full mt-0" value={tab.id}>
            <LogWindow
              className="h-full"
              messages={tab.data}
              stripChannel={tab.stripChannel}
            />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};
