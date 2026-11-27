'use client'

import { createContext, type KeyboardEvent, type RefObject } from 'react'

// whether the root allows several values. the input needs to know, to wrap
// itself in chips, and the root renders no element to hang a css hook on
export const MultipleContext = createContext(false)

// the content's footer, for the input to send focus to. the input and the
// content are siblings, and the content is portaled
export const FooterContext = createContext<RefObject<HTMLDivElement | null>>({
  current: null,
})

export const focusable = 'a[href], button:not(:disabled)'

// base ui only walks the arrow keys through its own items, and with `items`
// those can only be the filtered ones. so the footer takes real focus: arrow
// down from the last result, or with no results, moves into it
export function toFooter(
  event: KeyboardEvent<HTMLInputElement>,
  footer: HTMLDivElement | null,
) {
  if (event.key !== 'ArrowDown' || !footer) {
    return
  }

  const last = [
    ...(footer.parentElement?.querySelectorAll('[role="option"]') ?? []),
  ].at(-1)

  if (
    event.currentTarget.getAttribute('aria-activedescendant') ===
    (last?.id ?? null)
  ) {
    footer.querySelector<HTMLElement>(focusable)?.focus()
  }
}
