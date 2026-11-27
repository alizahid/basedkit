import { readFile } from 'node:fs/promises'

import { createTranslator, hasLocale } from 'next-intl'

import { type Section, sections } from '@/content'
import { expand } from '@/content/demos'
import { markdown as tables } from '@/content/props'
import { fill } from '@/intl/fill'
import { routing } from '@/intl/routing'

// imports and exports sit above the title; the page starts at it
const title = /^# /mu

// an example and what is in it, which is indented once
const example = /^<Example[^>]*>\n(?<code>[\s\S]*?)\n<\/Example>$/gmu
const indent = /^ {2}/gmu

// each page's path with .md on the end
export function params(section: Section) {
  return routing.locales.flatMap((locale) =>
    sections[section].map((page) => ({
      locale,
      page: `${page}.md`,
    })),
  )
}

// a page's MDX source with the translations filled in
export async function markdown(locale: string, section: Section, page: string) {
  if (!hasLocale(routing.locales, locale)) {
    return new Response(null, {
      status: 404,
    })
  }

  // the request config reads root params, which route handlers can't yet
  const t = createTranslator({
    locale,
    messages: (await import(`../intl/locales/${locale}.json`)).default,
  })

  const source = await readFile(
    `src/app/[locale]/${section}/${page.slice(0, -'.md'.length)}/page.mdx`,
    'utf8',
  )

  // ids come from our own files; a missing one fails the build
  const text = (id: string) => t(id as Parameters<typeof t>[0])

  const filled = fill(source.slice(source.search(title)), text)

  // there is no preview in markdown, so an example is its code, as on the
  // page: with the file of any demo component it uses
  const blocks = await Promise.all(
    Array.from(filled.matchAll(example), (match) =>
      expand((match.groups?.code ?? '').replace(indent, '')),
    ),
  )

  // the props tables are written out as markdown ones
  return new Response(
    tables(
      filled.replace(example, () => `\`\`\`tsx\n${blocks.shift()}\n\`\`\``),
      text,
    ),
    {
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
      },
    },
  )
}
