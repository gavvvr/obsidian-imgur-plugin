export default class DragEventCopy extends DragEvent {
  static create(fromEvent: DragEvent, files: File[] | FileList): DragEventCopy {
    const dataTransfer = new DataTransfer()
    for (const file of files) {
      dataTransfer.items.add(file)
    }

    return new DragEventCopy(fromEvent.type, {
      dataTransfer,
      clientX: fromEvent.clientX,
      clientY: fromEvent.clientY,
    })
  }
}
