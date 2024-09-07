import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Button } from "../ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorExpanded: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorExpanded: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Alert className="p-4 h-screen">
            <AlertTitle className="text-lg font-semibold">
              Something went wrong
            </AlertTitle>
            <AlertDescription>
              <p className="mt-2 text-sm">{this.state.error?.message}</p>
              <Collapsible
                className="mt-4"
                open={this.state.errorExpanded}
                onOpenChange={(open) => this.setState({ errorExpanded: open })}
              >
                <>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      {this.state.errorExpanded ? (
                        <ChevronUpIcon className="mr-2 h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="mr-2 h-4 w-4" />
                      )}
                      {this.state.errorExpanded ? "Hide" : "Show"} Stack Trace
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <pre className="text-xs overflow-auto bg-secondary p-2 rounded">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </CollapsibleContent>
                </>
              </Collapsible>
              <Button
                className="mt-4"
                onClick={() =>
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    errorExpanded: false,
                  })
                }
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )
      );
    }

    return this.props.children;
  }
}
