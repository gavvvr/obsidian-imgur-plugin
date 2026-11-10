import { ButtonComponent, Modal } from 'obsidian'

export default class ImageUploadBlockingModal extends Modal {
  #opened = false

  get isModalOpen(): boolean {
    return this.#opened
  }

  override onOpen(): void {
    this.titleEl.setText('Imgur plugin')
    this.contentEl.setText('Uploading image...')

    const buttonsDiv = this.modalEl.createDiv('modal-button-container')

    new ButtonComponent(buttonsDiv)
      .setButtonText('Cancel')
      .setCta()
      .onClick(() => {
        this.close()
      })
    this.#opened = true
  }

  override onClose(): void {
    this.#opened = false
  }
}
