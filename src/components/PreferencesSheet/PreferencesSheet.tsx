import React, { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Cog } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { StartupTab } from "./StartupTab";
import { BackupTab } from "./BackupTab";

enum PreferencesTab {
  Startup = "startup",
  Backup = "backup",
}

export const PreferencesSheet: React.FC = () => {
  const [isOpen, setOpen] = useState(false);

  const tabs = useMemo(
    () => [
      {
        id: PreferencesTab.Startup,
        label: "Startup",
      },
      {
        id: PreferencesTab.Backup,
        label: "Backup",
      },
    ],
    []
  );

  return (
    <Sheet open={isOpen} onOpenChange={(newOpen) => setOpen(newOpen)}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon">
          <Cog />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="max-w-none w-4/5 sm:max-w-none flex flex-col space-y-2"
      >
        <SheetHeader>
          <SheetTitle>Edit Preferences</SheetTitle>
          <SheetDescription>
            Make changes to your preferences here. Click save when you&apos;re
            done.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          orientation="vertical"
          defaultValue={PreferencesTab.Startup}
          className="mt-4"
        >
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={PreferencesTab.Startup}>
            <StartupTab />
          </TabsContent>
          <TabsContent value={PreferencesTab.Backup}>
            <BackupTab />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
