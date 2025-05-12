import { createEffect, type VoidComponent } from "solid-js"
import { HttpError, isHttpError } from "../utils/errors"

interface ErrorBoundaryFallbackProps {
  error: any
  onRetry: () => void
}
export const ErrorBoundaryFallback: VoidComponent<
  ErrorBoundaryFallbackProps
> = (p) => {
  if (isHttpError(p.error)) {
    return <HttpErrorFallback error={p.error} onRetry={p.onRetry} />
  }

  return <UnexpectedError error={p.error} />
}

const UnexpectedError: VoidComponent<{ error: any }> = (p) => {
  createEffect(() => console.error(p.error))
  return (
    <>
      <h1>An error occured</h1>
      <span>{p.error.toString?.()}</span>
    </>
  )
}

const HttpErrorFallback: VoidComponent<{
  error: HttpError
  onRetry: () => void
}> = (p) => {
  switch (p.error.response.status) {
    case 401:
    case 403:
      return <h1>Unauthorized</h1>
    case 404:
      return <h1>Not found</h1>
    case 502:
      return <h1>This website is not available right now</h1>
    default:
      return <UnexpectedError error={p.error} />
  }
}
