import * as stylex from '@stylexjs/stylex'
import { type ComponentProps } from 'react'

import { merge } from '#lib/stylex.js'

export type OverlayProps = ComponentProps<'div'> & {
  visible?: boolean
}

// a layer over its positioned parent, with its children centred on it. it
// stays mounted and is inert while hidden, so css can fade it both ways
export function Overlay({
  className,
  style,
  visible = true,
  ...props
}: OverlayProps) {
  return (
    <div
      inert={!visible}
      {...props}
      {...merge(stylex.props(styles.main), className, style)}
    />
  )
}

const hidden = ':is([inert])'

const still = '@media (prefers-reduced-motion: reduce)'

// the library's own, as radix themes has no overlay. it covers what is under
// it from the pointer; the keyboard can still reach it, so disable that too
const styles = stylex.create({
  main: {
    alignItems: 'center',
    backdropFilter: 'blur(calc(var(--ui-spacing) * 2))',
    backgroundColor: 'var(--panel-translucent)',
    // the parent's corners, for a parent that doesn't clip
    borderRadius: 'inherit',
    color: 'var(--gray-12)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--ui-spacing) * 3)',
    inset: 0,
    justifyContent: 'center',
    opacity: {
      [hidden]: 0,
      default: null,
    },
    padding: 'calc(var(--ui-spacing) * 4)',
    position: 'absolute',
    textAlign: 'center',
    transitionDuration: {
      [still]: '0s',
      default: '150ms',
    },
    transitionProperty: 'opacity, visibility',
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    visibility: {
      [hidden]: 'hidden',
      default: null,
    },
    // over positioned children of the parent
    zIndex: 1,
  },
})
