import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { parseMessage } from "@/lib/parseMessage";
import { formatDate, isSameDay } from "date-fns";
import { VisibilityObserver } from "./VisibilityObserver";

export interface LogWindowProps {
  className?: string;
  messages: string[];
  stripChannel?: boolean;
}

export const LogWindow: React.FC<LogWindowProps> = ({
  className,
  messages,
  stripChannel: shouldStripChannel,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const onBottomFlagRef = useRef(true);
  const dayVisibleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [dayVisible, setDayVisible] = useState(false);

  const parsedMessages = useMemo(
    () => messages.map((message) => parseMessage(message)),
    [messages]
  );

  const handleAreaScroll = useCallback(() => {
    const viewport = viewportRef.current;

    if (viewport) {
      onBottomFlagRef.current =
        viewport.scrollTop + viewport.clientHeight === viewport.scrollHeight;

      if (dayVisibleTimeoutRef.current) {
        clearTimeout(dayVisibleTimeoutRef.current);
      }

      setDayVisible(true);

      dayVisibleTimeoutRef.current = setTimeout(() => {
        setDayVisible(false);
      }, 2000);
    }
  }, []);

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
      onScroll={handleAreaScroll}
    >
      {parsedMessages.map((message, index) => (
        <React.Fragment key={index}>
          {((index > 0 &&
            !isSameDay(message.datetime, parsedMessages[index - 1].datetime)) ||
            index === 0) && (
            <>
              <VisibilityObserver className="[&.visible+.sticky]:opacity-100" />
              <div
                className={cn(
                  "sticky top-2 opacity-0 ease-in-out transition-opacity duration-500 text-center py-2",
                  dayVisible && "opacity-100"
                )}
              >
                <div
                  key={index}
                  className={cn(
                    "text-gray-500 bg-background inline-block px-2 py-1 rounded-md"
                  )}
                >
                  {formatDate(message.datetime, "d MMMM yyyy")}
                </div>
              </div>
            </>
          )}
          <pre key={index} className="text-wrap">
            {`${formatDate(message.datetime, "HH:mm:ss")} ${
              !shouldStripChannel && `[${message.channel}]`
            } ${message.message}`}
          </pre>
        </React.Fragment>
      ))}
    </ScrollArea>
  );
};
