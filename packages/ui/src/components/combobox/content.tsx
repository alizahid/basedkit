'use client'

import {
  type ComboboxListProps,
  type ComboboxPopupProps,
  type ComboboxPositionerProps,
  Combobox as Component,
} from '@base-ui/react/combobox'
import * as stylex from '@stylexjs/stylex'
import { type CSSProperties, type ReactNode, use, useRef } from 'react'

import { type ColorToken } from '#lib/colors.js'
import { listbox, listboxSize, listboxVariants } from '#lib/listbox.js'
import { panel } from '#lib/panel.js'
import { SizeContext } from '#lib/size.js'
import { merge } from '#lib/stylex.js'
import { ThemeContext } from '#lib/theme.js'

import { FooterContext, focusable } from './context.js'
import { Item } from './item.js'
import { itemLabel } from './utils.js'

export type ComboboxContentProps = Omit<ComboboxPopupProps, 'children'> &
  Pick<ComboboxPositionerProps, 'align' | 'anchor' | 'side' | 'sideOffset'> & {
    children?: ComboboxListProps['children']
    className?: string
    color?: ColorToken | 'gray'
    empty?: ReactNode
    footer?: ReactNode
    highContrast?: boolean
    search?: ReactNode
    status?: ReactNode
    style?: CSSProperties
    variant?: 'solid' | 'soft'
  }

// children are optional. left out, each of the root's `items` renders as an
// Item showing its label, which covers a plain list of strings or of
// { label, value } objects. pass a function, (item) => <Combobox.Item />, for
// custom rows. `empty` is shown when nothing matches what was typed, and
// `status` whenever it is set ("Loading…"). `search` takes a Combobox.Search,
// for a popup that holds its own filter input. `footer` is a row under the
// results for links and buttons, a way to everything or an action: it stays
// while the results scroll or run out, and arrow down from the last result
// moves focus into it. `side`, `align` and
// `sideOffset` move the popup, and `anchor` positions it against another
// element than the input or trigger
export function Content({
  align,
  anchor,
  children = renderItem,
  className,
  color,
  empty,
  footer,
  highContrast,
  search,
  side,
  sideOffset = 4,
  status,
  style,
  variant = 'solid',
  ...props
}: ComboboxContentProps) {
  const size = use(SizeContext)
  const theme = use(ThemeContext)

  return (
    <Component.Portal>
      <Component.Positioner
        align={align}
        anchor={anchor}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(panel.positioner)}
      >
        {/* portaled out of the provider's element, so its colors are set again */}
        <Component.Popup
          data-accent={color ?? theme.accent}
          data-gray={theme.gray}
          {...props}
          {...merge(
            stylex.props(
              listbox.content,
              listboxVariants[variant],
              highContrast && variant === 'solid' && listbox.contrast,
              ...listboxSize(size),
              styles.content,
            ),
            className,
            style,
          )}
        >
          {search}

          {status ? (
            <Component.Status {...stylex.props(listbox.empty)}>
              {status}
            </Component.Status>
          ) : null}

          {/* base ui keeps this mounted and only fills it when there are no
              matches, so the padding is on the inner element */}
          {empty ? (
            <Component.Empty>
              <div {...stylex.props(listbox.empty)}>{empty}</div>
            </Component.Empty>
          ) : null}

          <Component.List {...stylex.props(listbox.list, listbox.filtered)}>
            {children}
          </Component.List>

          {footer ? <Footer>{footer}</Footer> : null}
        </Component.Popup>
      </Component.Positioner>
    </Component.Portal>
  )
}

// the arrow keys move between its links and buttons, and past either end
// back to the input it was entered from
function Footer({ children }: { children: ReactNode }) {
  const ref = use(FooterContext)

  const input = useRef<HTMLElement>(null)

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: the arrow keys move between the links and buttons inside
    // biome-ignore lint/a11y/noStaticElementInteractions: the arrow keys move between the links and buttons inside
    <div
      onFocus={(event) => {
        if (
          event.relatedTarget instanceof HTMLElement &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          input.current = event.relatedTarget
        }
      }}
      onKeyDown={(event) => {
        // base ui closes the popup, and focus would be left on nothing
        if (event.key === 'Escape') {
          input.current?.focus()
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
          return
        }

        event.preventDefault()

        const items = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(focusable),
        ]

        const next =
          items[
            items.indexOf(event.target as HTMLElement) +
              (event.key === 'ArrowDown' ? 1 : -1)
          ] ?? input.current

        next?.focus()
      }}
      ref={ref}
      {...stylex.props(styles.footer)}
    >
      {children}
    </div>
  )
}

function renderItem(item: unknown) {
  const label = itemLabel(item)

  return (
    <Item key={label} value={item}>
      {label}
    </Item>
  )
}

const styles = stylex.create({
  // as wide as the input, unlike a select's popup which fits its items. the
  // minimum is for a narrow button trigger
  content: {
    maxWidth: 'var(--available-width)',
    minWidth: 'calc(var(--ui-spacing) * 48)',
    width: 'var(--anchor-width)',
  },
  // a row at the bottom of the popup, divided from the list
  footer: {
    boxShadow: 'inset 0 1px var(--gray-a6)',
    padding: 'calc(var(--listbox-content-padding) + var(--ui-spacing) * 2)',
  },
})
