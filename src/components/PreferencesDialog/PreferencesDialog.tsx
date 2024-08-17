import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

export interface PreferencesDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PreferencesDialog: React.FC<PreferencesDialogProps> = ({
  open,
  onClose,
}) => {
  const { toast } = useToast();

  const [serverDllPath, setServerDllPath] = useState("");
  const [serverDataPath, setServerDataPath] = useState("");
  const [port, setPort] = useState<number | undefined>();
  const [dotnetPath, setDotnetPath] = useState("");

  const handleSave = async () => {
    try {
      await window.api.saveConfig({
        serverDllPath,
        serverDataPath,
        port,
        dotnetPath,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDllBrowse = () => {
    window.api.initiateDllPathDialog().then((path) => {
      if (path) {
        setServerDllPath(path);
      }
    });
  };

  const handleDataBrowse = () => {
    window.api.initiateDataPathDialog().then((path) => {
      if (path) {
        setServerDataPath(path);
      }
    });
  };

  const handleDotnetBrowse = () => {
    window.api.selectDotnetPath().then((pathSelected) => {
      if (pathSelected) {
        setDotnetPath(pathSelected);
      }
    });
  };

  const isValid = port === undefined || (port > 0 && port <= 65535);

  useEffect(() => {
    window.api.getConfig().then((config) => {
      setServerDllPath(config.serverDllPath ?? "");
      setServerDataPath(config.serverDataPath ?? "");
      setPort(config.port);
      setDotnetPath(config.dotnetPath ?? "");
    });
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Preferences</DialogTitle>
          <DialogDescription>
            Make changes to your preferences here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Server DLL Path</Label>
            <Input className="col-span-2" value={serverDllPath} readOnly />
            <Button onClick={handleDllBrowse}>Browse</Button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Data Path</Label>
            <Input className="col-span-2" value={serverDataPath} readOnly />
            <Button onClick={handleDataBrowse}>Browse</Button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Dotnet Path</Label>
            <Input className="col-span-2" value={dotnetPath} readOnly />
            <Button onClick={handleDotnetBrowse}>Browse</Button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Port</Label>
            <Input
              className="col-span-2"
              value={port}
              type="number"
              placeholder="42420"
              max={65535}
              min={0}
              onChange={(event) =>
                setPort(
                  event.target.value === ""
                    ? undefined
                    : parseInt(event.target.value, 10)
                )
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!isValid}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
