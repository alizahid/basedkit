import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './intl/routing'

const intl = createMiddleware(routing)

// a page, with or without its locale: every one has a .md version
const page = /\/(?:overview|components|hooks)\/[^/.]+$/u

// an agent that asks for markdown in its Accept header gets the .md version
// of the page at the page's own address; a browser never asks. every page
// also names its .md version in a Link header, for those that don't ask
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!page.test(pathname)) {
    return intl(request)
  }

  const markdown = `${pathname}.md`

  if (request.headers.get('accept')?.includes('text/markdown')) {
    const url = request.nextUrl.clone()

    url.pathname = markdown

    // the locale is worked out as for any other request. for the default one
    // that is already a rewrite; a path with its locale is passed through as
    // it came, so it is rewritten here
    const response = intl(
      new NextRequest(url, {
        headers: request.headers,
      }),
    )

    const rewrite = response.headers.has('x-middleware-rewrite')
      ? response
      : NextResponse.rewrite(url)

    rewrite.headers.append('vary', 'Accept')

    return rewrite
  }

  const response = intl(request)

  response.headers.append('vary', 'Accept')
  response.headers.set(
    'link',
    `<${markdown}>; rel="alternate"; type="text/markdown"`,
  )

  return response
}

export const config = {
  // dotted paths are files, bar the .md version of a page
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/(.*)\\.md'],
}
