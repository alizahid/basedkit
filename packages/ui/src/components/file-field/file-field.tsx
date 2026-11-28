'use client'

import {
  Input as Component,
  type InputProps as ComponentProps,
} from '@base-ui/react/input'
import * as stylex from '@stylexjs/stylex'
import {
  type CSSProperties,
  type DragEvent,
  type ComponentProps as ReactComponentProps,
  type Ref,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { Spinner } from '#components/spinner/spinner.js'
import { type ColorToken } from '#lib/colors.js'
import { Cross2Icon, icon, UploadIcon } from '#lib/icons.js'
import { input } from '#lib/input.js'
import { type RadiusToken, radii } from '#lib/radii.js'
import { merge } from '#lib/stylex.js'

// what a ref to the field holds: not the input, as focusing it does more
export type FileFieldHandle = {
  focus: () => void
}

export type FileFieldProps = Omit<
  ReactComponentProps<'input'>,
  | 'children'
  | 'className'
  | 'color'
  | 'defaultValue'
  | 'placeholder'
  | 'ref'
  | 'size'
  | 'style'
  | 'type'
  | 'value'
> & {
  className?: string
  color?: ColorToken | 'gray'
  filesLabel?: string
  layout?: 'field' | 'zone'
  loading?: boolean
  locale?: string
  maxSize?: number
  onReject?: (files: Array<File>) => void
  onValueChange?: (files: Array<File>) => void
  placeholder?: string
  radius?: RadiusToken
  ref?: Ref<FileFieldHandle>
  removeLabel?: string
  size?: '1' | '2' | '3'
  style?: CSSProperties
  value?: Array<File>
  variant?: 'surface' | 'soft'
}

// whether a file passes an `accept` list: extensions, mime types and
// wildcards like image/*. while a file is still being dragged the browser
// gives its type but not its name, so an extension can't be checked yet and
// passes
function accepts(accept: string | undefined, type: string, name?: string) {
  const tokens = (accept ?? '')
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)

  return (
    tokens.length === 0 ||
    tokens.some((token) => {
      if (token.startsWith('.')) {
        return name === undefined || name.toLowerCase().endsWith(token)
      }

      return token.endsWith('/*')
        ? type.startsWith(token.slice(0, -1))
        : type === token
    })
  )
}

const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte']

// 1536 becomes "1.5 kB", in the locale's own digits and separators
function size(bytes: number, locale?: string) {
  const unit = Math.min(
    Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)),
    units.length - 1,
  )

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    style: 'unit',
    unit: units[unit],
    unitDisplay: 'short',
  }).format(bytes / 1024 ** unit)
}

// the same file picked twice is one file
function key(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

// a dropzone over a native file input, as tall as a text field. the input
// covers the dropzone, so clicking, the keyboard, dropping and form submission
// are the browser's own; this adds the drag states, checks dropped files
// against `accept`, which browsers only apply to the picker, and against
// `maxSize`, in bytes; the ones that fail go to `onReject`. it shows what was
// picked: one file's name, or how many, with their size. with `multiple`,
// new files add to the ones already there. className and style go to the
// dropzone, a flex container, and the ref is a handle that focuses the field;
// everything else goes to the input. `layout` only
// styles it: a `field` is a row as tall as a text field, a `zone` a padded box
// with its content stacked in the middle
export function FileField({
  accept,
  className,
  color,
  disabled,
  // ponytail: one template for every count. a function prop, if a locale's
  // plural forms matter
  filesLabel = '{count} files',
  layout = 'field',
  loading = false,
  locale,
  maxSize = Number.POSITIVE_INFINITY,
  multiple,
  onReject,
  onValueChange,
  placeholder = 'Drop files here or click to browse',
  radius,
  ref: forwarded,
  removeLabel = 'Remove',
  size: scale = '2',
  style,
  value,
  variant = 'surface',
  ...props
}: FileFieldProps) {
  const ref = useRef<HTMLInputElement>(null)

  // a form library focuses the field that fails its validation. a focused
  // file input shows nothing after a click on submit, so focusing the field
  // also opens the picker, which browsers allow shortly after a click or a
  // key press. while loading or disabled it only takes the focus
  useImperativeHandle(forwarded, () => ({
    focus() {
      ref.current?.focus()
      ref.current?.click()
    },
  }))

  const [own, setOwn] = useState<Array<File>>([])
  const [drag, setDrag] = useState<'over' | 'rejected'>()

  const files = value ?? own

  const [first] = files

  const label =
    files.length === 1 && first
      ? first.name
      : filesLabel.replace(
          '{count}',
          new Intl.NumberFormat(locale).format(files.length),
        )

  // the input holds the same files as the field shows, so a form submits
  // them and `required` sees them
  const write = (next: Array<File>) => {
    const transfer = new DataTransfer()

    for (const file of next) {
      transfer.items.add(file)
    }

    if (ref.current) {
      ref.current.files = transfer.files
    }
  }

  // a controlled field's input follows `value`, also when the parent turns
  // the change down
  const commit = (next: Array<File>) => {
    write(value ?? next)
    setOwn(next)
    onValueChange?.(next)
  }

  const add = (list: Iterable<File>, folders: Array<File> = []) => {
    if (loading || disabled) {
      return
    }

    const all = [...list]

    const picked = all.filter(
      (file) => accepts(accept, file.type, file.name) && file.size <= maxSize,
    )

    const rejected = [
      ...folders,
      ...all.filter((file) => !picked.includes(file)),
    ]

    const next = multiple
      ? [
          ...new Map([...files, ...picked].map((file) => [key(file), file])),
        ].map(([, file]) => file)
      : picked.slice(0, 1)

    // dropping only files that aren't accepted changes nothing
    commit(picked.length > 0 ? next : files)

    if (rejected.length > 0) {
      onReject?.(rejected)
    }
  }

  // a form's reset empties the input, and react resets a form after its action
  const reset = useEffectEvent(() => {
    if (files.length > 0) {
      setOwn([])
      onValueChange?.([])
    }
  })

  useEffect(() => {
    const form = ref.current?.form

    const listener = () => {
      reset()
    }

    form?.addEventListener('reset', listener)

    return () => {
      form?.removeEventListener('reset', listener)
    }
  }, [])

  // a controlled value is written to the input too
  // biome-ignore lint/correctness/useExhaustiveDependencies: write only reads the ref
  useEffect(() => {
    if (value) {
      write(value)
    }
  }, [value])

  // the drag events are the dropzone's, so the remove button over the input
  // is part of it. on every dragover, which also allows the drop: a dragleave
  // between the input and the button can't leave the state behind
  const over = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const items = [...event.dataTransfer.items].filter(
      (item) => item.kind === 'file',
    )

    // dragged text isn't a file
    if (loading || disabled || items.length === 0) {
      return
    }

    setDrag(
      items.every((item) => !accepts(accept, item.type)) ? 'rejected' : 'over',
    )
  }

  const drop = (event: DragEvent<HTMLDivElement>) => {
    // the browser would replace the files, accepted or not, or open one
    // dropped on the remove button
    event.preventDefault()

    setDrag(undefined)

    // a dropped folder comes as a file with nothing in it. the file items are
    // in the order of the files
    const folders = [...event.dataTransfer.items]
      .filter((item) => item.kind === 'file')
      .map((item) => item.webkitGetAsEntry?.()?.isDirectory ?? false)

    const dropped = [...event.dataTransfer.files]

    add(
      dropped.filter((_, index) => !folders[index]),
      dropped.filter((_, index) => folders[index]),
    )
  }

  // the browser's tooltip for an empty file input is its own "No file chosen":
  // an empty title hides it. with files it lists their names, and stays
  const title = props.title ?? (files.length > 0 ? undefined : '')

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: only the drag events, which have no keyboard; the input inside is the control
    // biome-ignore lint/a11y/noStaticElementInteractions: as above
    <div
      aria-busy={loading || undefined}
      data-accent={color}
      data-dragging={drag === 'over' ? '' : undefined}
      data-filled={files.length > 0 ? '' : undefined}
      data-loading={loading ? '' : undefined}
      data-rejected={drag === 'rejected' ? '' : undefined}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDrag(undefined)
        }
      }}
      onDragOver={over}
      onDrop={drop}
      {...merge(
        stylex.props(
          styles.main,
          variants[variant],
          sizes[scale],
          layout === 'zone' && styles.zone,
          radius && radii[radius],
        ),
        className,
        style,
      )}
    >
      {/* the spinner takes the icon's place and its space; its sizes are the
          icon's */}
      <Spinner loading={loading} size={scale}>
        <UploadIcon {...stylex.props(icon.small, styles.icon)} />
      </Spinner>

      {files.length > 0 ? (
        <span {...stylex.props(styles.text, styles.value)}>
          <span {...stylex.props(styles.text, styles.name)}>{label}</span>

          <span {...stylex.props(styles.size)}>
            {size(
              files.reduce((total, file) => total + file.size, 0),
              locale,
            )}
          </span>
        </span>
      ) : (
        <span {...stylex.props(styles.text)}>{placeholder}</span>
      )}

      <Component
        {...(props as ComponentProps)}
        accept={accept}
        disabled={disabled}
        multiple={multiple}
        onChange={(event) => {
          props.onChange?.(event)

          add(event.currentTarget.files ?? [])
        }}
        // while loading the field looks the same but takes nothing: the
        // picker stays shut, for the keyboard too, and `add` ignores a drop
        onClick={(event) => {
          props.onClick?.(event)

          if (loading) {
            event.preventDefault()
          }
        }}
        // escape removes the files, as in a combobox. the event stops here,
        // so a dialog around the field stays open
        onKeyDown={(event) => {
          props.onKeyDown?.(event)

          if (event.key === 'Escape' && files.length > 0 && !loading) {
            event.stopPropagation()

            commit([])
          }
        }}
        ref={ref}
        render={<input type="file" />}
        title={title}
        {...stylex.props(styles.input)}
      />

      {files.length > 0 ? (
        <button
          aria-label={`${removeLabel} ${label}`}
          data-disabled={disabled ? '' : undefined}
          disabled={disabled}
          inert={loading}
          onClick={() => {
            commit([])

            // the button is about to go, and would take the focus with it
            ref.current?.focus()
          }}
          // for the pointer: the keyboard has escape
          tabIndex={-1}
          type="button"
          {...stylex.props(input.action, styles.remove)}
        >
          <Cross2Icon {...stylex.props(icon.small)} />
        </button>
      ) : null}
    </div>
  )
}

// stylex doesn't order these against each other, so they must not overlap.
// in order: disabled, a rejected drag, in red, an accepted drag, in green,
// invalid, hover
const off = ':has(input:disabled)'
const rejected = ':is([data-rejected]):not(:has(input:disabled))'
const dragging = ':is([data-dragging]):not(:has(input:disabled))'
const invalid =
  ':has(input[data-invalid]):not([data-dragging], [data-rejected], :has(input:disabled))'
const hover =
  ':hover:not([data-dragging], [data-rejected], :has(input:disabled), :has(input[data-invalid]))'

// ours: radix themes has no file field. the sizes and colours follow its
// text field
const styles = stylex.create({
  icon: {
    flexShrink: 0,
  },
  // covers the dropzone, unseen: the click, the drop and the focus are its own
  input: {
    cursor: {
      ':disabled': 'not-allowed',
      ':is([data-loading] > *):not(:disabled)': 'default',
      default: 'pointer',
    },
    inset: 0,
    opacity: 0,
    position: 'absolute',
  },
  main: {
    // the size of `icon.small`, for the remove button and the room it needs
    '--file-field-icon': 'calc(1lh - var(--ui-spacing))',
    alignItems: 'center',
    backgroundColor: {
      [dragging]: 'var(--green-a3)',
      [off]: 'var(--gray-a3)',
      [rejected]: 'var(--red-a3)',
      default: 'var(--file-field-background)',
    },
    borderColor: {
      [dragging]: 'var(--green-8)',
      [hover]: {
        '@media (hover: hover)': 'var(--file-field-border-hover)',
        default: null,
      },
      [invalid]: 'var(--red-8)',
      [off]: 'var(--gray-a6)',
      [rejected]: 'var(--red-8)',
      default: 'var(--file-field-border)',
    },
    // a field's border is the text field's; a zone dashes it
    borderStyle: 'solid',
    borderWidth: 1,
    color: {
      [dragging]: 'var(--green-a11)',
      [off]: 'var(--gray-a9)',
      [rejected]: 'var(--red-a11)',
      default: 'var(--file-field-color)',
    },
    display: 'flex',
    fontWeight: '400',
    gap: 'calc(var(--ui-spacing) * 2)',
    height: 'var(--file-field-height)',
    outline: {
      ':has(input:focus-visible)': '2px solid var(--focus-8)',
      default: 'none',
    },
    outlineOffset: -1,
    // room for the remove button, which is out of the flow
    paddingInlineEnd: {
      ':is([data-filled])':
        'calc(var(--file-field-padding) * 2 + var(--file-field-icon))',
      default: 'var(--file-field-padding)',
    },
    paddingInlineStart: 'var(--file-field-padding)',
    position: 'relative',
    textAlign: 'start',
    // one line, cut short. inherited, so a className on a box can wrap it
    whiteSpace: 'nowrap',
  },
  name: {
    color: 'var(--file-field-value)',
  },
  // over the input, in the corner: centred in a field of the default height,
  // and still in the corner of a taller box
  remove: {
    color: 'var(--gray-a11)',
    height: 'var(--file-field-icon)',
    insetBlockStart:
      'var(--file-field-remove, calc((var(--file-field-height) - var(--file-field-icon)) / 2 - 1px))',
    insetInlineEnd: 'var(--file-field-padding)',
    justifyContent: 'center',
    position: 'absolute',
    width: 'var(--file-field-icon)',
  },
  size: {
    flexShrink: 0,
  },
  text: {
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // the name and the size stay on one line, whichever way the field runs
  value: {
    display: 'flex',
    gap: 'calc(var(--ui-spacing) * 2)',
    whiteSpace: 'nowrap',
  },
  // the same room on both sides keeps the content centred under the button
  zone: {
    '--file-field-border': 'var(--file-field-zone-border)',
    '--file-field-border-hover': 'var(--file-field-zone-border-hover)',
    '--file-field-remove': 'var(--file-field-padding)',
    borderStyle: 'dashed',
    flexDirection: 'column',
    height: 'auto',
    justifyContent: 'center',
    paddingBlock: 'var(--file-field-zone)',
    paddingInlineEnd:
      'calc(var(--file-field-padding) * 2 + var(--file-field-icon))',
    paddingInlineStart:
      'calc(var(--file-field-padding) * 2 + var(--file-field-icon))',
    textAlign: 'center',
    whiteSpace: 'normal',
  },
})

// variants only set variables, the dropzone decides where they apply
const variants = stylex.create({
  soft: {
    '--file-field-background': 'var(--accent-a3)',
    // a soft field has no border, like a soft text field; a zone keeps its dashes
    '--file-field-border': 'transparent',
    '--file-field-border-hover': 'transparent',
    '--file-field-color': 'var(--accent-a11)',
    '--file-field-value': 'var(--accent-12)',
    '--file-field-zone-border': 'var(--accent-a6)',
    '--file-field-zone-border-hover': 'var(--accent-a8)',
  },
  surface: {
    '--file-field-background': 'var(--surface)',
    '--file-field-border': 'var(--gray-a7)',
    '--file-field-border-hover': 'var(--gray-a8)',
    '--file-field-color': 'var(--gray-a11)',
    '--file-field-value': 'var(--gray-12)',
    '--file-field-zone-border': 'var(--gray-a7)',
    '--file-field-zone-border-hover': 'var(--gray-a8)',
  },
})

// the text field's heights, corners and text
const sizes = stylex.create({
  1: {
    '--file-field-height': 'calc(var(--ui-spacing) * 6)',
    '--file-field-padding': 'calc(var(--ui-spacing) * 1.5)',
    '--file-field-zone': 'calc(var(--ui-spacing) * 4)',
    borderRadius: 'var(--ui-radius-sm)',
    fontSize: 'var(--ui-text-xs)',
    lineHeight: 'var(--ui-text-xs--line-height)',
  },
  2: {
    '--file-field-height': 'calc(var(--ui-spacing) * 8)',
    '--file-field-padding': 'calc(var(--ui-spacing) * 2)',
    '--file-field-zone': 'calc(var(--ui-spacing) * 6)',
    borderRadius: 'var(--ui-radius-sm)',
    fontSize: 'var(--ui-text-sm)',
    lineHeight: 'var(--ui-text-sm--line-height)',
  },
  3: {
    '--file-field-height': 'calc(var(--ui-spacing) * 10)',
    '--file-field-padding': 'calc(var(--ui-spacing) * 3)',
    '--file-field-zone': 'calc(var(--ui-spacing) * 8)',
    borderRadius: 'var(--ui-radius-md)',
    fontSize: 'var(--ui-text-base)',
    lineHeight: 'var(--ui-text-base--line-height)',
  },
})
