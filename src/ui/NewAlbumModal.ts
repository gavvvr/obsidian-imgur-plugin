import { ButtonComponent, Modal, TextAreaComponent, TextComponent } from 'obsidian'

export class NewAlbumModal extends Modal {
  createButtonHandler: (title: string, descriotion?: string) => Promise<void>

  override onOpen(): void {
    this.setModalTitle()
    const { newAlbumNameField, newAlbumDescriptionField } = this.createInputs()
    const { createButton, cancelButton } = this.createButtons()

    setRequiredAlbumNameChangeCallback(newAlbumNameField, createButton)
    this.setCreateButtonCallback(createButton, newAlbumNameField, newAlbumDescriptionField)

    // TODO: cancel the ongoing http request if possible!
    cancelButton.onClick(() => this.close())
  }

  private setModalTitle() {
    this.titleEl.setText('Create new album')
  }

  private createInputs() {
    const newAlbumNameField = new TextComponent(
      this.modalEl.createDiv('setting-item').createDiv('setting-item-info'),
    )
    newAlbumNameField.setPlaceholder('Album name (required)')
    newAlbumNameField.inputEl.setAttr('maxlength', 55)
    newAlbumNameField.inputEl.setCssStyles({ width: '100%' })
    const newAlbumDescriptionField = new TextAreaComponent(
      this.modalEl.createDiv('setting-item').createDiv('setting-item-info'),
    )
    newAlbumDescriptionField.setPlaceholder('Album description (optional)')
    newAlbumDescriptionField.inputEl.setCssStyles({ width: '100%' })
    return { newAlbumNameField, newAlbumDescriptionField }
  }

  private createButtons() {
    const buttonsContainer = this.modalEl.createDiv('modal-button-container')

    const cancelButton = new ButtonComponent(buttonsContainer)
    cancelButton.setButtonText('Cancel')

    const createButton = new ButtonComponent(buttonsContainer)
    createButton.setButtonText('Create')
    disableActionButton(createButton)

    return { createButton, cancelButton }
  }
  private setCreateButtonCallback(
    createButton: ButtonComponent,
    albumNameField: TextComponent,
    albumDescriptionField: TextAreaComponent,
  ) {
    createButton.onClick(async () => {
      setButtonInProgress(createButton)
      await this.createButtonHandler(albumNameField.getValue(), albumDescriptionField.getValue())
      this.close()
    })
  }
}

function setRequiredAlbumNameChangeCallback(
  newAlbumNameField: TextComponent,
  createButton: ButtonComponent,
) {
  newAlbumNameField.onChange((value) => {
    if (value.length === 0) {
      disableActionButton(createButton)
    } else {
      activateActionButton(createButton)
    }
  })
}

function setButtonInProgress(createButton: ButtonComponent) {
  createButton.setDisabled(true)
  createButton.setIcon('loader')
}

function activateActionButton(createButton: ButtonComponent) {
  createButton.setDisabled(false)
  createButton.setCta()
}

function disableActionButton(button: ButtonComponent) {
  button.setDisabled(true)
  button.buttonEl.setAttribute('disabled', 'true')
  button.removeCta()
}
