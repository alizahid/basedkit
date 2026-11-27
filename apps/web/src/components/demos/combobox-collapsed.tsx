'use client'

import { Combobox } from 'basedkit'

type Item = {
  label: string
  value: string
}

type Props = {
  empty: string
  items: Array<Item>
  more: string
  placeholder: string
  search: string
}

// a multiple combobox with a button trigger that stays on one line: the first
// value, then a count of the rest. the function child is why this is a client
// component
export function CollapsedCombobox({
  empty,
  items,
  more,
  placeholder,
  search,
}: Props) {
  return (
    <Combobox.Root defaultValue={items.slice(0, 3)} items={items} multiple>
      <Combobox.Trigger className="w-48">
        {(value: Array<Item>) => {
          const [first, ...rest] = value

          if (!first) {
            return placeholder
          }

          return rest.length > 0
            ? `${first.label} (+${rest.length} ${more})`
            : first.label
        }}
      </Combobox.Trigger>

      <Combobox.Content
        empty={empty}
        search={<Combobox.Search placeholder={search} />}
      />
    </Combobox.Root>
  )
}
