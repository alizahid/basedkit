'use client'

import { Link } from 'basedkit'
import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

// link to the current page as Markdown, for people and for agents
export function Source({ children }: Props) {
  // with the locale, as the address bar has it
  const pathname = usePathname()

  const href = `${pathname}.md`

  return (
    <>
      {/* react moves this to the head, where agents look for it */}
      <link href={href} rel="alternate" type="text/markdown" />

      <Link className="text-sm" color="gray" href={href}>
        {children}
      </Link>
    </>
  )
}
