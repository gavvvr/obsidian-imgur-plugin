import { ClickableToken, Editor, EditorPosition, MarkdownFileInfo, parseLinktext } from 'obsidian'

import { IMGUR_POTENTIALLY_SUPPORTED_FILES_EXTENSIONS } from '../imgur/constants'

function localEmbeddedImageExpectedBoundaries(
  from: ClickableToken,
): [EditorPosition, EditorPosition] {
  return [
    { ...from.start, ch: from.start.ch - 3 },
    { ...from.end, ch: from.end.ch + 2 },
  ]
}

export const findLocalFileUnderCursor = (editor: Editor, ctx: MarkdownFileInfo) => {
  const clickable = editor.getClickableTokenAt(editor.getCursor())

  if (!clickable) return null
  if (clickable.type !== 'internal-link') return null

  const [localImageExpectedStart, localImageExpectedEnd] =
    localEmbeddedImageExpectedBoundaries(clickable)

  const clickablePrefix = editor.getRange(localImageExpectedStart, clickable.start)
  const clickableSuffix = editor.getRange(clickable.end, localImageExpectedEnd)
  if (clickablePrefix !== '![[' || clickableSuffix !== ']]') return null

  const lt = parseLinktext(clickable.text)
  const file = ctx.app.metadataCache.getFirstLinkpathDest(lt.path, ctx.file.path)

  if (!IMGUR_POTENTIALLY_SUPPORTED_FILES_EXTENSIONS.includes(file.extension)) return null

  return {
    file,
    start: localImageExpectedStart,
    end: localImageExpectedEnd,
  }
}
