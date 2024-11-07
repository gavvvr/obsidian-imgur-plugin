import 'obsidian'

declare module 'obsidian' {
  interface MarkdownSubView {
    clipboardManager: ClipboardManager
  }

  interface CanvasView extends TextFileView {
    handlePaste: (e: ClipboardEvent) => Promise<void>
  }

  interface Editor {
    getClickableTokenAt(position: EditorPosition): ClickableToken | null
  }

  interface ClickableToken {
    displayText: string
    text: string
    type: string
    start: EditorPosition
    end: EditorPosition
  }

  interface Canvas {
    posCenter(): Point
    createTextNode(n: NewTextNode): any
  }

  interface NewTextNode {
    pos: Point
    position: string
    text: string
  }

  interface ClipboardManager {
    handlePaste(e: ClipboardEvent): void
    handleDrop(e: DragEvent): void
  }
}
