import { MetadataCache, ReferenceCache, TFile, Vault } from 'obsidian'

export const getAllCachedReferencesForFile = (metadataCache: MetadataCache) => (file: TFile) => {
  const allLinks = metadataCache.resolvedLinks

  const notesWithLinks = []
  for (const [notePath, noteLinks] of Object.entries(allLinks)) {
    for (const [linkName] of Object.entries(noteLinks)) {
      if (linkName === file.name) notesWithLinks.push(notePath)
    }
  }

  const linksByNote = notesWithLinks.reduce(
    (acc, note) => {
      const noteMetadata = metadataCache.getCache(note)
      const noteLinks = noteMetadata.embeds
      if (noteLinks) {
        acc[note] = noteLinks.filter((l) => l.link === file.name)
      }
      return acc
    },
    {} as Record<string, ReferenceCache[]>,
  )
  return linksByNote
}

export const filesAndLinksStatsFrom = (referencesByNote: Record<string, ReferenceCache[]>) => {
  return {
    filesCount: Object.keys(referencesByNote).length,
    linksCount: Object.values(referencesByNote).reduce((count, refs) => count + refs.length, 0),
  }
}

export async function replaceAllLocalReferencesWithRemoteOne(
  vault: Vault,
  allFileReferencesByNotes: Record<string, ReferenceCache[]>,
  remoteImageUrl: string,
) {
  for (const [notePath, refs] of Object.entries(allFileReferencesByNotes)) {
    const noteFile = vault.getFileByPath(notePath)
    const refsStartOffsetsSortedDescending = refs
      .map((ref) => ({
        start: ref.position.start.offset,
        end: ref.position.end.offset,
      }))
      .sort((ref1, ref2) => ref2.start - ref1.start)

    await vault.process(noteFile, (noteContent) => {
      let updatedContent = noteContent
      refsStartOffsetsSortedDescending.forEach((refPos) => {
        updatedContent =
          updatedContent.substring(0, refPos.start) +
          `![](${remoteImageUrl})` +
          updatedContent.substring(refPos.end)
      })
      return updatedContent
    })
  }
}
