import * as stylex from '@stylexjs/stylex'

// stylex doesn't order these against each other, so they must not overlap
const header = ':is(thead *)'
const last = ':is(tbody > tr:last-child > *)'

export type Align = 'start' | 'center' | 'end' | 'baseline'

// where the cells sit in a row taller than they are: the middle unless the
// root says otherwise. set on the root for the whole table or on a row for
// its own cells, and read by the cells
export const aligns = stylex.create({
  baseline: {
    '--table-align': 'baseline',
  },
  center: {
    '--table-align': 'middle',
  },
  end: {
    '--table-align': 'bottom',
  },
  start: {
    '--table-align': 'top',
  },
})

// shared by the three kinds of cell. the line under a row is drawn by its
// cells; the last row of a surface table has none
export const cell = stylex.create({
  bold: {
    fontWeight: '700',
  },
  main: {
    backgroundColor: {
      [header]: 'var(--table-header)',
      default: null,
    },
    boxShadow: {
      [last]: 'var(--table-last-row)',
      default: 'inset 0 -1px var(--gray-a5)',
    },
    fontWeight: '400',
    // works as a min-height
    height: 'var(--table-cell-height)',
    paddingBlock: 'var(--table-cell-padding-y)',
    paddingInline: 'var(--table-cell-padding-x)',
    // in an Inset that reaches the container's edge, the cells at that edge
    // take the container's padding, so they line up with what is around
    paddingInlineEnd: {
      ':last-child': 'var(--inset-end, var(--table-cell-padding-x))',
      default: null,
    },
    paddingInlineStart: {
      ':first-child': 'var(--inset-start, var(--table-cell-padding-x))',
      default: null,
    },
    textAlign: 'start',
    verticalAlign: 'var(--table-align)',
  },
})
