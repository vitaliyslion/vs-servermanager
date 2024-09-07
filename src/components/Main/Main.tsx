import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LogsOutput } from "../LogsOutput";
import { CommandInput } from "../CommandInput";
import { Launch } from "../Launch";
import { MainControlsPanel } from "../MainControlsPanel";
import { TooltipProvider } from "../ui/tooltip";
import { Footer } from "../Footer";

export const Main: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const handleServerToggle = (isRunning: boolean) => {
    setRunning(isRunning);
  };

  useEffect(() => {
    const offLog = window.api.onLog((rawMessage) => {
      const newMessages = rawMessage.split("\n").filter(Boolean);

      setMessages((prev) => [...prev, ...newMessages]);
    });

    const offClose = window.api.onClose(() => {
      setRunning(false);
    });

    return () => {
      offLog();
      offClose();
    };
  }, []);

  if (import.meta.env.DEV) {
    useEffect(() => {
      if (document.title.startsWith("Dev - ")) return;

      document.title = `Dev - ${document.title}`;
      ``;
    }, []);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Launch>
        <div className="h-screen flex flex-col">
          <div className="flex flex-1 h-0 flex-col p-2 space-y-2">
            <MainControlsPanel
              className="w-full"
              isRunning={running}
              onToggle={handleServerToggle}
              onStart={() => setMessages([])}
            />

            <LogsOutput className="flex-1 h-0" messages={messages} />
            <CommandInput className="w-full relative" disabled={!running} />
          </div>
          <Footer />
        </div>
      </Launch>
      <Toaster />
    </TooltipProvider>
  );
};
