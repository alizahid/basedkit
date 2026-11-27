'use client'

import { Toast, type ToastProps } from 'basedkit'
import { useSyncExternalStore } from 'react'

export type Options = Pick<ToastProps, 'position' | 'variant'>

// the site has one <Toast>, so an example that shows a position or a variant
// changes that one's props before adding its toast
let options: Options = {}

const listeners = new Set<() => void>()

export function configure(next: Options) {
  options = next

  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

export function Toaster() {
  const current = useSyncExternalStore(
    subscribe,
    () => options,
    () => options,
  )

  return <Toast {...current} />
}
