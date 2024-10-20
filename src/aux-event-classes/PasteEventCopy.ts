export default class PasteEventCopy extends ClipboardEvent {
  constructor(originalEvent: ClipboardEvent) {
    const { files } = originalEvent.clipboardData
    const dt = new DataTransfer()
    for (const file of files) {
      dt.items.add(file)
    }
    super('paste', { clipboardData: dt })
  }
}
