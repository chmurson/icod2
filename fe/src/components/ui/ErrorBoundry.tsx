import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Card, Flex, IconButton, Separator } from "@radix-ui/themes";
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "./Button";
import { Text } from "./Typography";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
  showDetails: boolean;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?:
    | ReactNode
    | ((arg: { handleRetry: () => void; isRetrying: boolean }) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  enableRetry?: boolean;
  enableErrorReporting?: boolean;
  showErrorDetails?: boolean;
  className?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      showDetails: false,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableErrorReporting = true } = this.props;
    const { errorId } = this.state;

    this.setState({
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.group(`🔴 Error Boundary Caught Error [${errorId}]`);
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, errorId);
    }

    // Report error to monitoring service
    if (enableErrorReporting) {
      this.reportError(error, errorInfo, errorId);
    }
  }

  private reportError = (
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string,
  ) => {
    try {
      const errorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Send to your error reporting service
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // }).catch(console.error);

      console.log("Error reported:", errorReport);
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    }
  };

  private handleRetry = () => {
    const { enableRetry = true } = this.props;

    if (!enableRetry) return;

    this.setState({ isRetrying: true });

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
        showDetails: false,
        errorId: "",
      });
    }, 1000);
  };

  private toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  private copyErrorToClipboard = async () => {
    const { error, errorInfo, errorId } = this.state;

    if (!error || !errorInfo) return;

    const errorText = `Error ID: ${errorId}
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}`;

    try {
      await navigator.clipboard.writeText(errorText);
      console.log("Error details copied to clipboard");
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const {
      children,
      fallback,
      enableRetry = true,
      showErrorDetails = true,
      className,
    } = this.props;
    const { hasError, error, errorInfo, isRetrying, showDetails, errorId } =
      this.state;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      if (typeof fallback === "function") {
        return fallback({
          handleRetry: this.handleRetry,
          isRetrying: this.state.isRetrying,
        });
      }
      return fallback;
    }

    return (
      <div
        className={twMerge(
          "flex items-center justify-center min-h-[400px] p-6",
          className,
        )}
      >
        <Card className="max-w-2xl w-full p-6">
          <Flex direction="column" align="center" gap="4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <Text
              variant="sectionTitle"
              className="text-center text-red-600 dark:text-red-400"
            >
              Oops! Something went wrong
            </Text>

            <Text
              variant="primaryText"
              className="text-center text-gray-600 dark:text-gray-300 max-w-md"
            >
              We're sorry, but something unexpected happened. The error has been
              logged and we'll look into it.
            </Text>

            <Flex gap="3" align="center" wrap="wrap" justify="center">
              {enableRetry && (
                <Button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  variant="primary"
                  loading={isRetrying}
                  loadingText="Retrying..."
                  iconSlot={<ReloadIcon />}
                >
                  Try Again
                </Button>
              )}

              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
              >
                Reload Page
              </Button>
            </Flex>

            {showErrorDetails && error && (
              <div className="w-full mt-4">
                <Separator className="w-full mb-4" />

                <Flex direction="column" gap="3">
                  <Button
                    onClick={this.toggleDetails}
                    variant="secondary"
                    className="self-start"
                  >
                    {showDetails ? "Hide" : "Show"} Error Details
                  </Button>

                  {showDetails && (
                    <Card className="bg-gray-50 dark:bg-gray-900/50 p-4">
                      <Flex direction="column" gap="3">
                        {/* Error ID */}
                        <div>
                          <Text variant="label" className="block mb-1">
                            Error ID:
                          </Text>
                          <Text
                            variant="secondaryText"
                            className="font-mono text-sm"
                          >
                            {errorId}
                          </Text>
                        </div>

                        <div>
                          <Text variant="label" className="block mb-1">
                            Error Message:
                          </Text>
                          <Text variant="primaryError" className="text-sm">
                            {error.message}
                          </Text>
                        </div>

                        {error.stack && (
                          <div>
                            <Text variant="label" className="block mb-2">
                              Stack Trace:
                            </Text>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-48 overflow-y-auto">
                              {error.stack}
                            </pre>
                          </div>
                        )}

                        {errorInfo?.componentStack && (
                          <div>
                            <Text variant="label" className="block mb-2">
                              Component Stack:
                            </Text>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-48 overflow-y-auto">
                              {errorInfo.componentStack}
                            </pre>
                          </div>
                        )}

                        <Button
                          onClick={this.copyErrorToClipboard}
                          variant="secondary"
                          className="self-start mt-2"
                        >
                          Copy Error Details
                        </Button>
                      </Flex>
                    </Card>
                  )}
                </Flex>
              </div>
            )}
          </Flex>
        </Card>
      </div>
    );
  }
}

export default ErrorBoundary;
