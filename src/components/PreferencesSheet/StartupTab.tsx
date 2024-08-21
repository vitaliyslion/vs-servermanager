import React, { useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { BrowseButton } from "../BrowseButton";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

export interface StartupTabProps {
  className?: string;
}

export const StartupTab: React.FC<StartupTabProps> = ({ className }) => {
  const { toast } = useToast();
  const {
    setValue,
    reset,
    register,
    handleSubmit,
    getValues,
    formState: { isValid },
  } = useForm<{
    serverDllPath: string;
    serverDataPath: string;
    port: number | undefined;
    dotnetPath: string;
  }>({
    defaultValues: {
      serverDllPath: "",
      serverDataPath: "",
      port: undefined,
      dotnetPath: "",
    },
  });

  const handleDllBrowse = () => {
    window.api.initiateDllPathDialog().then((path) => {
      if (path) {
        setValue("serverDllPath", path);
      }
    });
  };

  const handleDataBrowse = () => {
    window.api.initiateDataPathDialog().then((path) => {
      if (path) {
        setValue("serverDataPath", path);
      }
    });
  };

  const handleDotnetBrowse = () => {
    window.api.selectDotnetPath().then((pathSelected) => {
      if (pathSelected) {
        setValue("dotnetPath", pathSelected);
      }
    });
  };

  const handleSave = async () => {
    try {
      await window.api.saveConfig(getValues());
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    window.api.getConfig().then((config) => {
      reset({
        serverDllPath: config.serverDllPath ?? "",
        serverDataPath: config.serverDataPath ?? "",
        port: config.port,
        dotnetPath: config.dotnetPath ?? "",
      });
    });
  }, []);

  return (
    <div className={className}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Server DLL Path</Label>
          <Input
            className="col-span-2"
            {...register("serverDllPath", { required: true })}
            readOnly
          />
          <BrowseButton onClick={handleDllBrowse} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Dotnet Path</Label>
          <Input className="col-span-2" {...register("dotnetPath")} readOnly />
          <BrowseButton onClick={handleDotnetBrowse} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Data Path</Label>
          <Input
            className="col-span-2"
            {...register("serverDataPath")}
            readOnly
          />
          <BrowseButton onClick={handleDataBrowse} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Port</Label>
          <Input
            className="col-span-2"
            type="number"
            placeholder="42420"
            {...register("port", { min: 0, max: 65535, valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="flex flex-row-reverse">
        <Button onClick={handleSubmit(handleSave)} disabled={!isValid}>
          Save changes
        </Button>
      </div>
    </div>
  );
};
