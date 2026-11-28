// only what touches this package counts, for the changelog and for working out
// the next version
const commits = {
  path: '.',
}

/** @type {import('release-it').Config} */
export default {
  // release-it fills in the version itself
  git: {
    // biome-ignore lint/suspicious/noTemplateCurlyInString: release-it's placeholder
    commitMessage: 'chore: release v${version}',
    // biome-ignore lint/suspicious/noTemplateCurlyInString: release-it's placeholder
    tagName: 'v${version}',
  },
  // a release on github for the tag, with the version's changelog as its
  // notes. needs GITHUB_TOKEN, which the release script takes from gh
  github: {
    release: true,
    // biome-ignore lint/suspicious/noTemplateCurlyInString: release-it's placeholder
    releaseName: 'v${version}',
  },
  plugins: {
    '@release-it/conventional-changelog': {
      commitsOpts: commits,
      gitRawCommitsOpts: commits,
      infile: 'changelog.md',
      preset: 'conventionalcommits',
      writerOpts: {
        // the changelog is the library's: commits for the docs site are left
        // out, even ones that touched a file here, and the rest lose their
        // scope, which would say "ui" on every line. breaking changes are
        // notes with a commit of their own, so they get the same; their
        // heading is the commit footer's keyword, in capitals, and their text
        // is wrapped as the commit message was. every heading is in sentence
        // case
        finalizeContext: (context) => ({
          ...context,
          commitGroups: context.commitGroups
            .map((group) => ({
              ...group,
              commits: group.commits
                .filter((commit) => commit.scope !== 'web')
                .map((commit) => ({
                  ...commit,
                  scope: null,
                })),
              // "Bug Fixes" becomes "Bug fixes"
              title: group.title.charAt(0) + group.title.slice(1).toLowerCase(),
            }))
            .filter((group) => group.commits.length > 0),
          noteGroups: context.noteGroups
            .map((group) => ({
              ...group,
              notes: group.notes
                .filter((note) => note.commit.scope !== 'web')
                .map((note) => ({
                  ...note,
                  commit: {
                    ...note.commit,
                    scope: null,
                  },
                  text: note.text.replace(/\s*\n\s*/gu, ' '),
                })),
              title:
                group.title === 'BREAKING CHANGES'
                  ? '⚠ Breaking changes'
                  : group.title,
            }))
            .filter((group) => group.notes.length > 0),
        }),
      },
    },
  },
}
