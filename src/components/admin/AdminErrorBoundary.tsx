import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class AdminErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught admin error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in duration-500">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold">Something went wrong</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                        The admin panel encountered an unexpected error. This might be due to a temporary connection issue or a database schema mismatch.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="font-bold"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reload Page
                        </Button>
                        <Button
                            onClick={() => this.setState({ hasError: false })}
                            className="font-bold"
                        >
                            Try Again
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-8 p-4 bg-black/5 rounded text-left text-[10px] overflow-auto max-w-full text-destructive">
                            {this.state.error?.message}
                            {this.state.error?.stack}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
