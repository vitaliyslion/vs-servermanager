import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useToast } from "../ui/use-toast";

export const Launch: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { toast } = useToast();
  const [verificationFinished, setVerificationFinished] = useState(false);
  const [isDotnetInstalled, setIsDotnetInstalled] = useState(false);

  const handleSelectDotnet = async () => {
    try {
      const pathSelected = await window.api.selectDotnetPath();

      if (pathSelected) {
        setIsDotnetInstalled(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInstallDotnet = async () => {
    try {
      await window.api.installDotnet();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const ready = isDotnetInstalled;

  useEffect(() => {
    window.api.verifyDotnetInstalled().then((isInstalled) => {
      setIsDotnetInstalled(isInstalled);
      setVerificationFinished(true);
    });
  }, []);

  return ready ? (
    children
  ) : (
    <div className="flex items-center justify-center h-screen">
      {verificationFinished && (
        <div className="w-full px-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold">.NET is required</h1>
            <p className="text-muted-foreground">
              Please install .NET 7.0 or newer to continue
            </p>
          </div>

          <div className="w-full">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  I have it installed. Your silly app cannot find it!
                </AccordionTrigger>
                <AccordionContent>
                  Please{" "}
                  <span
                    className="underline underline-offset-4 hover:text-muted-foreground hover:cursor-pointer"
                    onClick={handleSelectDotnet}
                  >
                    select the path
                  </span>{" "}
                  to the dotnet executable
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  I don&apos;t have it installed. I need to install it.
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    We have an automatic installer for you.{" "}
                    <span
                      className="underline underline-offset-4 hover:text-muted-foreground hover:cursor-pointer"
                      onClick={handleInstallDotnet}
                    >
                      Please click to start
                    </span>
                  </p>
                  <p className="mt-2">
                    or you can install it manually from{" "}
                    <a
                      className="underline underline-offset-4 hover:text-muted-foreground"
                      href="https://dotnet.microsoft.com/en-us/download/dotnet"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Microsoft
                    </a>
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
};
