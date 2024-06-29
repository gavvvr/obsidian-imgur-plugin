import { App, ButtonComponent, Modal } from 'obsidian'

export default class InfoModal extends Modal {
  constructor(app: App, title: string, message: string) {
    super(app)

    this.setTitle(title)
    this.contentEl.createEl('p', { text: message })

    const buttonsDiv = this.modalEl.createDiv('modal-button-container')
    new ButtonComponent(buttonsDiv).setButtonText('Ok')
  }
}
