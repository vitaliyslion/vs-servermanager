import React, { useEffect, useState } from "react";

export const Footer: React.FC = () => {
  const [version, setVersion] = useState(null);

  useEffect(() => {
    window.api.getAppInfo().then((info) => {
      setVersion(info.version);
    });
  });

  return (
    <footer className="h-5 bg-secondary text-xs text-muted-foreground">
      <div className="container mx-auto px-2 h-full">
        <div className="flex justify-end items-center h-full">
          <div>Ver: {version}</div>
        </div>
      </div>
    </footer>
  );
};
