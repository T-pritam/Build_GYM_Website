"use client";

import { Component, ReactNode, Suspense } from "react";

type Props = { fallback: ReactNode; children: ReactNode };
type State = { failed: boolean };

class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[BUILD] 3D model failed to load, using procedural fallback:", error.message);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Suspense + error boundary around every GLB. While loading — and if the
 * file is missing/corrupt — the procedural fallback renders instead, so
 * the site looks complete with zero models in /public/models.
 */
export default function ModelBoundary({ fallback, children }: Props) {
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
