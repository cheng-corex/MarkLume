import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string }) {
    console.error("MarkLume 渲染错误:", error, errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          padding: "0 32px",
          textAlign: "center",
          background: "#1e1e1e",
          color: "#d4d4d4",
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 16, opacity: 0.6 }}>
            <circle cx="24" cy="24" r="20" stroke="#d4d4d4" strokeWidth="2" fill="none"/>
            <path d="M24 16v8M24 28v2" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 8px" }}>出了点问题</h2>
          <p style={{ fontSize: 13, color: "#a0a0a0", margin: "0 0 20px", maxWidth: 400, lineHeight: 1.5 }}>
            {this.state.error?.message || "应用遇到了一个意外错误"}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: "8px 24px",
              border: "none",
              borderRadius: 6,
              background: "#569cd6",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
