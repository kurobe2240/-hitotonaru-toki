import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('エラーが発生しました:', error);
    console.error('エラー情報:', errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error">
          エラーが発生しました: {this.state.error?.message}
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 