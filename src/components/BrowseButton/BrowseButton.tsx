import React from "react";
import { Button, ButtonProps } from "../ui/button";
import { FolderSearch2 } from "lucide-react";

export const BrowseButton: React.FC<ButtonProps> = (props) => (
  <Button size="icon" {...props}>
    <FolderSearch2 />
  </Button>
);
