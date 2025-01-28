import { EditorPosition, ReferenceCache } from 'obsidian'

function fixImageTypeIfNeeded(image: File) {
  if (passesInstanceofCheck(image)) {
    return image
  }
  return new File([image], image.name, { type: image.type, lastModified: image.lastModified })

  function passesInstanceofCheck(image: File): boolean {
    return image instanceof File
  }
}

function removeReferenceIfPresent(
  referencesByNote: Record<string, ReferenceCache[]>,
  referenceToRemove: { path: string; startPosition: EditorPosition },
) {
  if (!Object.keys(referencesByNote).includes(referenceToRemove.path)) return

  const refsFromOriginalNote = referencesByNote[referenceToRemove.path]
  const originalRefStart = referenceToRemove.startPosition
  const refForExclusion = refsFromOriginalNote.find(
    (r) =>
      r.position.start.line === originalRefStart.line &&
      r.position.start.col === originalRefStart.ch,
  )
  if (refForExclusion) {
    refsFromOriginalNote.remove(refForExclusion)
    if (refsFromOriginalNote.length === 0) {
      delete referencesByNote[referenceToRemove.path]
    }
  }
}

export { fixImageTypeIfNeeded, removeReferenceIfPresent }
