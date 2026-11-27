'use client'

import { Button, toast } from 'basedkit'

import { configure, type Options } from '@/components/toaster'

type Props = Options & {
  action?: string
  description?: string
  label: string
  title: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

// toasts are added from event handlers, which is why these are client
// components
export function ToastDemo({
  action,
  description,
  label,
  position,
  title,
  type,
  variant,
}: Props) {
  return (
    <Button
      onClick={() => {
        configure({
          position,
          variant,
        })

        const id = toast.add({
          actionProps: action
            ? {
                children: action,
                onClick: () => toast.close(id),
              }
            : undefined,
          description,
          title,
          type,
        })
      }}
      variant="soft"
    >
      {label}
    </Button>
  )
}
