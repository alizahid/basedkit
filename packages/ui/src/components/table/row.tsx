import * as stylex from '@stylexjs/stylex'
import { type ComponentProps } from 'react'

import { merge } from '#lib/stylex.js'

import { type Align, aligns } from './styles.js'

export type TableRowProps = Omit<ComponentProps<'tr'>, 'align'> & {
  align?: Align
}

// one row. `align` is where its cells sit when one of them makes it taller,
// over the root's
export function Row({ align, className, style, ...props }: TableRowProps) {
  return (
    <tr
      {...props}
      {...merge(stylex.props(align && aligns[align]), className, style)}
    />
  )
}
