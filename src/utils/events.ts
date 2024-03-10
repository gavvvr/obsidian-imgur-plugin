export function buildPasteEventCopy(
  originalEvent: ClipboardEvent,
  files: File[] | FileList,
) {
  const clipboardData = new DataTransfer()
  for (let i = 0; i < files.length; i += 1) {
    clipboardData.items.add(files[i])
  }

  return new ClipboardEvent(originalEvent.type, { clipboardData })
}

export default class PasteEventCopy extends ClipboardEvent {
  constructor(originalEvent: ClipboardEvent) {
    const { files } = originalEvent.clipboardData
    const dt = new DataTransfer()
    for (let i = 0; i < files.length; i += 1) {
      dt.items.add(files.item(i))
    }
    super('paste', { clipboardData: dt })
  }
}
