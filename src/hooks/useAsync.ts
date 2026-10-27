import { useCallback, useEffect, useRef, useState } from 'react'
import { reportError, toError } from '@/lib/errors'
import type { AsyncState } from '@/types'

const depsChanged = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length !== b.length || a.some((value, i) => !Object.is(value, b[i]))

export function useAsync<T>(task: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [prevDeps, setPrevDeps] = useState(deps)
  const taskRef = useRef(task)

  if (depsChanged(prevDeps, deps)) {
    setPrevDeps(deps)
    setState({ status: 'loading' })
  }

  useEffect(() => {
    taskRef.current = task
  })

  useEffect(() => {
    const controller = new AbortController()
    taskRef.current(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data })
      },
      (error: unknown) => {
        if (controller.signal.aborted) return
        reportError(error, 'useAsync')
        setState({ status: 'error', error: toError(error) })
      },
    )
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, ...deps])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { state, retry } as const
}
