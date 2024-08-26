import React, { useEffect } from "react";
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
import { Input } from "../ui/input";
import { FormField } from "../FormField";
import { Button } from "../ui/button";

export interface BackupTabProps {
  className?: string;
}

export const BackupTab: React.FC<BackupTabProps> = ({ className }) => {
  const {
    control,
    watch,
    resetField,
    handleSubmit,
    formState: { isValid },
    getValues,
    reset,
  } = useForm<{
    periodicBackup: {
      enabled: boolean;
      rule?: string;
      maxBufferSizeInGb?: number;
    };
    createBackupOnStop?: boolean;
  }>({
    defaultValues: {
      periodicBackup: {
        enabled: false,
        rule: undefined,
        maxBufferSizeInGb: 12,
      },
      createBackupOnStop: false,
    },
  });

  useEffect(() => {
    window.api.getConfig().then((config) => {
      if (config.periodicBackup) {
        reset({
          periodicBackup: config.periodicBackup,
          createBackupOnStop: config.createBackupOnStop,
        });
      }
    });
  }, []);

  const handleSave = () => window.api.saveConfig(getValues());

  const isScheduleEnabled = watch("periodicBackup.enabled");

  useEffect(() => {
    if (!isScheduleEnabled) {
      resetField("periodicBackup.rule");
      resetField("periodicBackup.maxBufferSizeInGb");
    }
  }, [isScheduleEnabled]);

  return (
    <div className={className}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">On server stopping</Label>
            <Controller
              control={control}
              name="createBackupOnStop"
              render={({ field: { value, onChange } }) => (
                <Switch checked={value} onCheckedChange={onChange} />
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Enable schedule</Label>
            <Controller
              control={control}
              name="periodicBackup.enabled"
              render={({ field: { value, onChange } }) => (
                <Switch checked={value} onCheckedChange={onChange} />
              )}
            />
          </div>
          {isScheduleEnabled && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Frequency</Label>
                <Controller
                  control={control}
                  name="periodicBackup.rule"
                  rules={{
                    validate: (value, formState) =>
                      formState.periodicBackup.enabled && !!value
                        ? true
                        : "Frequency is required",
                  }}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <FormField className="col-span-2" error={error?.message}>
                      <Select value={value} onValueChange={onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Every..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50 */1 * * *">1 hour</SelectItem>
                          <SelectItem value="50 */2 * * *">2 hours</SelectItem>
                          <SelectItem value="50 */3 * * *">3 hours</SelectItem>
                          <SelectItem value="50 */6 * * *">6 hours</SelectItem>
                          <SelectItem value="50 */12 * * *">
                            12 hours
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label>Max buffer size (in GB)</Label>
                </div>
                <Controller
                  control={control}
                  name="periodicBackup.maxBufferSizeInGb"
                  rules={{
                    min: {
                      value: 1,
                      message: "Value should be greater than 1",
                    },
                    max: {
                      value: 128,
                      message: "Value should be lower than 128",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <FormField className="flex flex-col col-span-2">
                      <Input type="number" {...field} />
                      {error && (
                        <span className="text-sm text-red-600 mt-1">
                          {error?.message}
                        </span>
                      )}
                    </FormField>
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  In case the value is lower than latest backup size, the backup
                  will always be preserved
                </p>
              </div>
              <div className="flex flex-row-reverse">
                <Button onClick={handleSubmit(handleSave)} disabled={!isValid}>
                  Save changes
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
