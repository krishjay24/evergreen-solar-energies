import { isRouteErrorResponse } from 'react-router'

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

export function toError(value: unknown): Error {
  if (value instanceof Error) return value
  if (typeof value === 'string') return new Error(value)
  return new Error(FALLBACK_MESSAGE)
}

export interface ErrorDetails {
  readonly title: string
  readonly message: string
  readonly status?: number
}

export function getErrorDetails(error: unknown): ErrorDetails {
  if (isRouteErrorResponse(error)) {
    return error.status === 404
      ? { status: 404, title: 'Page not found', message: 'The page you are looking for does not exist or has moved.' }
      : { status: error.status, title: error.statusText || 'Request failed', message: FALLBACK_MESSAGE }
  }
  return {
    title: 'Unexpected error',
    message: import.meta.env.DEV ? toError(error).message : FALLBACK_MESSAGE,
  }
}

export function reportError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) console.error(`[${context ?? 'app'}]`, error)
}
