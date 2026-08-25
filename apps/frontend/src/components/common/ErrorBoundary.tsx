import { Component, type ErrorInfo, type ReactNode } from "react";
import { CrashFallback } from "@/components/common/CrashFallback";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return <CrashFallback />;
    return this.props.children;
  }
}
