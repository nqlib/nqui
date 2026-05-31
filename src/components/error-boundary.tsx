import * as React from "react"

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: unknown[]
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged =
        prevProps.resetKeys?.some(
          (key, index) => key !== this.props.resetKeys?.[index]
        ) ?? false

      if (hasResetKeyChanged) {
        this.reset()
      }
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="font-semibold">Something went wrong</p>
            {this.state.error && (
              <p className="text-sm opacity-80">
                {this.state.error.message}
              </p>
            )}
            {this.props.resetKeys && (
              <button
                type="button"
                onClick={this.reset}
                className="mt-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
