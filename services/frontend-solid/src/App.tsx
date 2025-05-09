import {
  ErrorBoundary,
  Suspense,
  type ParentComponent,
  type VoidComponent,
} from "solid-js"
import { AppRoutes } from "./components/Routes"
import { ErrorBoundaryFallback } from "./components/ErrorBoundaryFallback"

const AppProviders: ParentComponent = (p) => {
  return (
    <Suspense fallback="Loading...">
      <ErrorBoundary
        fallback={(err, onRetry) => (
          <ErrorBoundaryFallback error={err} onRetry={onRetry} />
        )}
      >
        {p.children}
      </ErrorBoundary>
    </Suspense>
  )
}

export const App: VoidComponent = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}
