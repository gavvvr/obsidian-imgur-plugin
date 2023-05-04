export default class DragEventCopy extends DragEvent {
  static create(fromEvent: DragEvent, files: File[] | FileList): DragEventCopy {
    const dataTransfer = new DataTransfer()
    for (let i = 0; i < files.length; i += 1) {
      dataTransfer.items.add(files[i])
    }

    return new DragEventCopy(fromEvent.type, {
      dataTransfer,
      clientX: fromEvent.clientX,
      clientY: fromEvent.clientY,
    })
  }
}
