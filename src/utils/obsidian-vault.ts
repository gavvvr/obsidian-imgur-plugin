import { MetadataCache, ReferenceCache, TFile } from 'obsidian'

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
