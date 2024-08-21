import React, { useEffect, useRef } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { parseMessage } from "@/lib/parseMessage";

export interface LogWindowProps {
  className?: string;
  messages: string[];
  stripChannel?: boolean;
}

const stripChannel = (logMessage: string) => {
  const { datetime, message } = parseMessage(logMessage);

  return `${datetime} ${message}`;
};

export const LogWindow: React.FC<LogWindowProps> = ({
  className,
  messages,
  stripChannel: shouldStripChannel,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const onBottomFlagRef = useRef(true);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    if (onBottomFlagRef.current) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea
      ref={viewportRef}
      className={cn(className, "overflow-y-auto")}
      onScroll={() => {
        const viewport = viewportRef.current;

        if (viewport) {
          onBottomFlagRef.current =
            viewport.scrollTop + viewport.clientHeight ===
            viewport.scrollHeight;
        }
      }}
    >
      {messages.map((message, index) => (
        <pre key={index} className="text-wrap">
          {shouldStripChannel ? stripChannel(message) : message}
        </pre>
      ))}
    </ScrollArea>
  );
};
