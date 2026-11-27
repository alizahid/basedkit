import { readdir, readFile } from 'node:fs/promises'

import { cache } from 'react'

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

// an example that only renders a demo component is one line that says
// nothing, so the demo's file follows it
export async function expand(code: string) {
  return [
    code,
    ...(await demos())
      .filter((demo) => new RegExp(`<${demo.name}\\b`, 'u').test(code))
      .map((demo) => demo.code),
  ].join('\n\n')
}
