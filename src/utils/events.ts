export function buildPasteEventCopy(originalEvent: ClipboardEvent, files: File[] | FileList) {
  const clipboardData = new DataTransfer()
  for (const file of files) {
    clipboardData.items.add(file)
  }

  return new ClipboardEvent(originalEvent.type, { clipboardData })
}
