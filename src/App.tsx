import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import "./app.css";
import { Button } from "./components/ui/button";
import { Cog } from "lucide-react";
import { PreferencesDialog } from "./components/PreferencesDialog";
import { LogsOutput } from "./components/LogsOutput";
import { CommandInput } from "./components/CommandInput";
import { Launch } from "./components/Launch";

export const App: React.FC = () => {
  const { toast } = useToast();

  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const handleToggleClick = async () => {
    if (running) {
      await window.api.stop();
      setRunning(false);
    } else {
      try {
        await window.api.start();
        setRunning(true);
        setMessages([]);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
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
    <>
      <Launch>
        <div className="h-screen flex flex-col p-2 space-y-2">
          <div className="w-full flex justify-end space-x-4">
            <Button
              onClick={handleToggleClick}
              variant={running ? "destructive" : "default"}
            >
              {running ? "Stop" : "Start"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPreferencesOpen(true)}
            >
              <Cog />
            </Button>
          </div>

          <LogsOutput className="flex-1 h-0" messages={messages} />
          <CommandInput className="w-full relative" disabled={!running} />

          <PreferencesDialog
            open={preferencesOpen}
            onClose={() => setPreferencesOpen(false)}
          />
        </div>
      </Launch>
      <Toaster />
    </>
  );
};
