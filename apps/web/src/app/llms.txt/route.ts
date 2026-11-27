import { createTranslator } from 'next-intl'

import { type Section, sections } from '@/content'
import messages from '@/intl/locales/en.json'

import { description } from '../../../../../packages/ui/package.json'

// the index agents look for: every page, by section, linked to its markdown
// version. in english, as the convention has no place for locales
export function GET(request: Request) {
  const t = createTranslator({
    locale: 'en',
    messages,
  })

  const { origin } = new URL(request.url)

  const lists = (Object.keys(sections) as Array<Section>).map((section) =>
    [
      `## ${t(`nav.${section}`)}`,
      '',
      ...sections[section].map(
        (page) => `- [${t(`nav.${page}`)}](${origin}/${section}/${page}.md)`,
      ),
    ].join('\n'),
  )

  return new Response(
    [
      `# ${t('metadata.title')}`,
      `> ${description}`,
      'Every page is also served as markdown: add .md to its address, or ask for it with an "Accept: text/markdown" header.',
      ...lists,
    ].join('\n\n'),
    {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    },
  )
}
