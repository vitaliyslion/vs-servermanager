import React, { useEffect, useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldJumpToEnd = useRef(false);

  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyTraversalIndex, setHistoryTraversalIndex] = useState<
    number | null
  >(null);

  const onHistoryTraversal = (index: number) => {
    let newCommand = "";

    const outOfBounds = index < 0 || index >= history.length;

    if (outOfBounds) {
      newCommand = "";
      setHistoryTraversalIndex(null);
    } else {
      newCommand = history[index];
      setHistoryTraversalIndex(index);
    }

    setCommand(newCommand);
    shouldJumpToEnd.current = true;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && command) {
      window.api.sendCommand(command);
      setHistory([...history, command]);
      setCommand("");
    }

    if (event.key === "ArrowUp") {
      if (historyTraversalIndex === null) {
        onHistoryTraversal(history.length - 1);
      } else {
        onHistoryTraversal(historyTraversalIndex - 1);
      }
    }

    if (event.key === "ArrowDown") {
      if (historyTraversalIndex === null) {
        onHistoryTraversal(0);
      } else {
        onHistoryTraversal(historyTraversalIndex + 1);
      }
    }
  };

  useEffect(() => {
    if (shouldJumpToEnd.current && inputRef.current) {
      const timeout = setTimeout(() => {
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length
        );
        shouldJumpToEnd.current = false;
      }, 0);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [command]);

  return (
    <div className={className}>
      <Label>
        <SquareChevronRight className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
      </Label>
      <Input
        ref={inputRef}
        className="pl-9"
        value={command}
        autoComplete="off"
        autoCorrect="off"
        disabled={disabled}
        onChange={(event) => {
          const { value } = event.target;

          setCommand(value);

          if (!value) {
            setHistoryTraversalIndex(null);
          }
        }}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
