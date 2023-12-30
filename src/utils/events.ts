export function buildPasteEventCopy(originalEvent: ClipboardEvent, files: File[] | FileList) {
  const clipboardData = new DataTransfer()
  for (let i = 0; i < files.length; i += 1) {
    clipboardData.items.add(files[i])
  }

  return new ClipboardEvent(originalEvent.type, { clipboardData })
}
