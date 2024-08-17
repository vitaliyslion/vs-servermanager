import React, { useEffect, useRef } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

export interface LogWindowProps {
  className?: string;
  messages: string[];
}

export const LogWindow: React.FC<LogWindowProps> = ({
  className,
  messages,
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
          {message}
        </pre>
      ))}
    </ScrollArea>
  );
};
