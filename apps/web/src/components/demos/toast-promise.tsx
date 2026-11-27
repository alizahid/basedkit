'use client'

import { Button, toast } from 'basedkit'

import { configure } from '@/components/toaster'

type Props = {
  error: string
  label: string
  loading: string
  success: string
}

export function ToastPromiseDemo({ error, label, loading, success }: Props) {
  return (
    <Button
      onClick={() => {
        configure({})

        toast.promise(
          new Promise((resolve) => {
            setTimeout(resolve, 2000)
          }),
          {
            error: {
              title: error,
              type: 'error',
            },
            loading: {
              title: loading,
            },
            success: {
              title: success,
              type: 'success',
            },
          },
        )
      }}
      variant="soft"
    >
      {label}
    </Button>
  )
}
