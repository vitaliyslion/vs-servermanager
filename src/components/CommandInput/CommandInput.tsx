import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SquareChevronRight } from "lucide-react";

export interface CommandInputProps {
  className?: string;
  disabled: boolean;
}

export const CommandInput: React.FC<CommandInputProps> = ({
  className,
  disabled,
}) => {
  const [command, setCommand] = useState("");

  return (
    <div className={className}>
      <Label>
        <SquareChevronRight className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
      </Label>
      <Input
        className="pl-9"
        value={command}
        autoComplete="off"
        autoCorrect="off"
        disabled={disabled}
        onChange={(event) => setCommand(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            window.api.sendCommand(command);
            setCommand("");
          }
        }}
      />
    </div>
  );
};
