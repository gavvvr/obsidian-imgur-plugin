import { ClickableToken, EditorPosition } from 'obsidian'

export function localEmbeddedImageExpectedBoundaries(
  from: ClickableToken,
): [EditorPosition, EditorPosition] {
  return [
    { ...from.start, ch: from.start.ch - 3 },
    { ...from.end, ch: from.end.ch + 2 },
  ]
}
