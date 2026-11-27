import { readdir, readFile } from 'node:fs/promises'

import { cn } from 'cn'
import { getTranslations } from 'next-intl/server'
import { type ComponentProps, cache } from 'react'

import { fill } from '@/intl/fill'

import { Code } from './code'
import { highlight } from './pre'

type Props = ComponentProps<'div'> & {
  // the example's source, added by the remark plugin in src/mdx
  code?: string
  orientation?: 'horizontal' | 'vertical'
}

const component = /^export function (?<name>\w+)/mu

// the demo components: the name of each, and its file. one component a file,
// so that an example shows only the one it uses
const demos = cache(async () => {
  const folder = 'src/components/demos'

  return Promise.all(
    (await readdir(folder)).map(async (file) => {
      const code = await readFile(`${folder}/${file}`, 'utf8')

      return {
        code: `// ${file}\n${code.trim()}`,
        name: code.match(component)?.groups?.name,
      }
    }),
  )
})

// a live preview with its code underneath. an example that only renders a
// demo component is one line that says nothing, so the demo's file follows
// it. vertical stacks larger components instead of wrapping them
export async function Example({
  code,
  orientation = 'horizontal',
  ...props
}: Props) {
  const t = await getTranslations()

  const source = code
    ? [
        fill(code, (id) => t(id as Parameters<typeof t>[0])),
        ...(await demos())
          .filter((demo) => new RegExp(`<${demo.name}\\b`, 'u').test(code))
          .map((demo) => demo.code),
      ].join('\n\n')
    : undefined

  const html = source ? await highlight(source, 'tsx') : undefined

  return (
    <div className="mt-4 border border-(--gray-a6)">
      <div
        className={cn(
          'flex min-h-32 items-center justify-center gap-12 p-6',
          orientation === 'vertical' ? 'flex-col' : 'flex-wrap',
        )}
        {...props}
      />

      {source && html ? (
        <Code
          code={source}
          html={html}
          labels={{
            copy: t('common.copy-code'),
            hide: t('common.hide-code'),
            show: t('common.show-code'),
          }}
        />
      ) : null}
    </div>
  )
}
