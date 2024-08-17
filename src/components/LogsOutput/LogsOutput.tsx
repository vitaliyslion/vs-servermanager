import React, { useMemo } from "react";
import { LogWindow } from "../LogWindow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

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
          const regex =
            /(\d{1,2}\.\d{1,2}\.\d{4} \d{2}:\d{2}:\d{2}) \[(.*?)\] (.*)/;
          const match = message.match(regex);

          if (match) {
            const [, , channel] = match;

            if (channel === "Server Event") {
              acc.serverEvents.push(message);
            } else if (channel === "Server Notification") {
              acc.serverNotifications.push(message);
            } else if (channel === "Server Chat") {
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
      },
      {
        id: LogTab.ServerEvent,
        label: "Events",
        data: serverEvents,
      },
      {
        id: LogTab.ServerNotification,
        label: "Notifications",
        data: serverNotifications,
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
            <LogWindow className="h-full" messages={tab.data} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};
