import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { HardDriveDownload, Play, Square } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { PreferencesSheet } from "../PreferencesSheet";

export interface MainControlsPanelProps {
  className?: string;
  isRunning: boolean;
  onToggle: (isRunning: boolean) => void;
  onStart: () => void;
}

export const MainControlsPanel: React.FC<MainControlsPanelProps> = ({
  className,
  isRunning,
  onToggle,
  onStart,
}) => {
  const { toast } = useToast();
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [serverStarting, setServerStarting] = useState(false);
  const [serverStopping, setServerStopping] = useState(false);

  const handleBackupClick = async () => {
    setBackupInProgress(true);
    try {
      const name = await window.api.generateBackup();

      toast({
        title: "Backup",
        description: `Completed - ${name}`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBackupInProgress(false);
    }
  };

  const stopServer = async () => {
    try {
      setServerStopping(true);
      await window.api.stop();
      onToggle(false);
    } finally {
      setServerStopping(false);
    }
  };

  const startServer = async () => {
    try {
      setServerStarting(true);
      onStart();
      await window.api.start();
      onToggle(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setServerStarting(false);
    }
  };

  const handleToggleClick = () => {
    if (isRunning) {
      stopServer();
    } else {
      startServer();
    }
  };

  return (
    <div className={cn("flex justify-between space-x-4", className)}>
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              disabled={!isRunning}
              isLoading={backupInProgress}
              onClick={handleBackupClick}
            >
              <HardDriveDownload />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate Backup</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex space-x-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={isRunning ? "destructive" : "default"}
              isLoading={serverStarting || serverStopping}
              onClick={handleToggleClick}
            >
              {isRunning ? <Square /> : <Play />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isRunning ? "Stop Server" : "Start Server"}
          </TooltipContent>
        </Tooltip>
        <PreferencesSheet />
      </div>
    </div>
  );
};
