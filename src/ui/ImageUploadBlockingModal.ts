import { ButtonComponent, Modal } from 'obsidian'

export default class ImageUploadBlockingModal extends Modal {
  isOpen = false

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
    this.isOpen = true
  }

  override onClose(): void {
    this.isOpen = false
  }
}
