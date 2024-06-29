import { App, ButtonComponent, Modal } from 'obsidian'

export default class UpdateLinksConfirmationModal extends Modal {
  private updateOnceButton: ButtonComponent
  private doNotUpdateButton: ButtonComponent

  constructor(app: App, localFileName: string, stats: { filesCount: number; linksCount: number }) {
    super(app)

    this.setTitle('Replace links in vault')

    this.contentEl.createEl('p', {
      text: `Do you want to replace internal links that link to original local file (${localFileName}) with remote link?`,
    })
    this.contentEl.createEl('p', {
      text: `This will affect ${stats.linksCount} links in ${stats.filesCount} files.`,
    })

    const buttonsDiv = this.modalEl.createDiv('modal-button-container')
    this.updateOnceButton = new ButtonComponent(buttonsDiv).setButtonText('Yes')
    this.doNotUpdateButton = new ButtonComponent(buttonsDiv).setButtonText('Do not update')
  }

  onDoUpdateClick(callback: (evt: MouseEvent) => any) {
    this.updateOnceButton.onClick(callback)
  }

  onDoNotUpdateClick(callback: (evt: MouseEvent) => any) {
    this.doNotUpdateButton.onClick(callback)
  }

  disableButtons() {
    this.updateOnceButton.setDisabled(true)
    this.doNotUpdateButton.setDisabled(true)
  }
}
