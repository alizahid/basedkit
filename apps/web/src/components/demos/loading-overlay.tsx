'use client'

import { Button, Card, LoadingOverlay, TextField } from 'basedkit'
import { useState } from 'react'

type Props = {
  email: string
  name: string
  save: string
}

// a form that is covered for two seconds when it is saved. the state is why
// this is a client component
export function LoadingOverlayDemo({ email, name, save }: Props) {
  const [loading, setLoading] = useState(false)

  return (
    <Card className="relative flex w-64 flex-col gap-3">
      <TextField.Root placeholder={name} />
      <TextField.Root placeholder={email} />

      <Button
        onClick={() => {
          setLoading(true)

          setTimeout(() => {
            setLoading(false)
          }, 2000)
        }}
      >
        {save}
      </Button>

      <LoadingOverlay visible={loading} />
    </Card>
  )
}
