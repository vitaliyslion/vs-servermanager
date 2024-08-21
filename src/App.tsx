import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import "./app.css";
import { LogsOutput } from "./components/LogsOutput";
import { CommandInput } from "./components/CommandInput";
import { Launch } from "./components/Launch";
import { MainControlsPanel } from "./components/MainControlsPanel";
import { TooltipProvider } from "./components/ui/tooltip";

export const App: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const handleServerToggle = (isRunning: boolean) => {
    setRunning(isRunning);

    if (isRunning) {
      setMessages([]);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add("dark");

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
        <div className="h-screen flex flex-col p-2 space-y-2">
          <MainControlsPanel
            className="w-full"
            isRunning={running}
            onToggle={handleServerToggle}
          />

          <LogsOutput className="flex-1 h-0" messages={messages} />
          <CommandInput className="w-full relative" disabled={!running} />
        </div>
      </Launch>
      <Toaster />
    </TooltipProvider>
  );
};
