import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface BackupTabProps {
  className?: string;
}

export const BackupTab: React.FC<BackupTabProps> = ({ className }) => {
  const { control, watch } = useForm<{
    periodicBackup: {
      enabled: boolean;
      rule?: string;
    };
  }>({
    defaultValues: {
      periodicBackup: {
        enabled: false,
        rule: undefined,
      },
    },
  });

  const isEnabled = watch("periodicBackup.enabled");

  return (
    <div className={className}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Enabled</Label>
            <Controller
              control={control}
              name="periodicBackup.enabled"
              render={({ field: { value, onChange } }) => (
                <Switch checked={value} onCheckedChange={onChange} />
              )}
            />
          </div>
          {isEnabled && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Frequency</Label>
              <Controller
                control={control}
                name="periodicBackup.rule"
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Every..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="* 1 * * *">1 hour</SelectItem>
                      <SelectItem value="* 2 * * *">2 hours</SelectItem>
                      <SelectItem value="* 6 * * *">6 hours</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
