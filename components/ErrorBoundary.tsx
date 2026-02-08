import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-red-100 text-center h-full min-h-[400px]">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <AlertTriangle className="text-red-500 w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong with the preview</h2>
          <p className="text-slate-600 mb-6 max-w-md">
            The resume data received was inconsistent or caused a rendering error. 
            ({this.state.error?.message})
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RefreshCcw size={16} />
            Reload Application
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
