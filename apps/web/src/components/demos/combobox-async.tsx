'use client'

import { Combobox } from 'basedkit'
import { useRef, useState } from 'react'

type Item = {
  label: string
  value: string
}

type Props = {
  empty: string
  hint: string
  items: Array<Item>
  loading: string
  placeholder: string
}

// loads its options as you type. nothing is fetched until there is a query,
// and the previous results are dropped while the next ones load. the timeout
// stands in for a request
export function AsyncCombobox({
  empty,
  hint,
  items: all,
  loading,
  placeholder,
}: Props) {
  const [items, setItems] = useState<Array<Item>>([])
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(false)

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // one message at a time: loading, then a prompt to type, then no results
  let message = empty

  if (pending) {
    message = loading
  } else if (!query) {
    message = hint
  }

  return (
    <Combobox.Root
      // the "server" has already filtered, so base ui shouldn't filter again
      filter={null}
      items={items}
      onInputValueChange={(value) => {
        clearTimeout(timer.current)

        setQuery(value)
        setItems([])
        setPending(Boolean(value))

        if (!value) {
          return
        }

        timer.current = setTimeout(() => {
          setItems(
            all.filter((item) =>
              item.label.toLowerCase().includes(value.toLowerCase()),
            ),
          )

          setPending(false)
        }, 600)
      }}
    >
      <Combobox.Input placeholder={placeholder} />

      <Combobox.Content
        empty={pending ? undefined : message}
        status={pending ? message : undefined}
      />
    </Combobox.Root>
  )
}
