import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Cog, HardDriveDownload } from "lucide-react";
import { PreferencesDialog } from "../PreferencesDialog";
import { useToast } from "../ui/use-toast";

export interface MainControlsPanelProps {
  className?: string;
  isRunning: boolean;
  onToggle: (isRunning: boolean) => void;
}

export const MainControlsPanel: React.FC<MainControlsPanelProps> = ({
  className,
  isRunning,
  onToggle,
}) => {
  const { toast } = useToast();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);

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

  const handleToggleClick = async () => {
    if (isRunning) {
      await window.api.stop();
      onToggle(false);
    } else {
      try {
        await window.api.start();
        onToggle(true);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className={cn("flex justify-between space-x-4", className)}>
      <div>
        <Button
          variant="secondary"
          size="icon"
          disabled={!isRunning}
          isLoading={backupInProgress}
          onClick={handleBackupClick}
        >
          <HardDriveDownload />
        </Button>
      </div>
      <div className="flex space-x-4">
        <Button
          onClick={handleToggleClick}
          variant={isRunning ? "destructive" : "default"}
        >
          {isRunning ? "Stop" : "Start"}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setPreferencesOpen(true)}
        >
          <Cog />
        </Button>
      </div>

      <PreferencesDialog
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </div>
  );
};
