import React, { useEffect } from "react";
import "./app.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Main } from "./components/Main/Main";

export const App: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <ErrorBoundary>
      <Main />
    </ErrorBoundary>
  );
};
