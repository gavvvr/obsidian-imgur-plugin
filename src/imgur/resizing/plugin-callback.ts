import { Editor, Notice } from 'obsidian'
import ImgurSize from './ImgurSize'
import findImgurMarkdownImage from './md-image-parsing'
import resizeTo from './resizing'

const editorCheckCallbackFor = (size: ImgurSize) => (checking: boolean, editor: Editor) => {
  const lineNumber = editor.getCursor().line
  const match = findImgurMarkdownImage(editor.getLine(lineNumber), editor.getCursor().ch)

  if (!match.exists) return false
  if (checking && match.exists) return true

  let replacement
  try {
    replacement = resizeTo(size)(match.mdImagePieces)
  } catch (e) {
    if (e instanceof Error) {
      new Notice(e.message)
    } else {
      console.error(e)
    }
    return false
  }

  editor.replaceRange(
    replacement.content,
    { line: lineNumber, ch: replacement.from },
    { line: lineNumber, ch: replacement.to },
  )
  return true
}

export default editorCheckCallbackFor
