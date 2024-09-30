import { ButtonComponent } from 'obsidian'

export default class ImgurAuthenticationStatus {
  private authStatusDiv: HTMLDivElement
  private buttonsDiv: HTMLDivElement

  private authButton?: ButtonComponent

  authButtonClick: (evt: MouseEvent) => void
  logoutButtonClick: (evt: MouseEvent) => Promise<void>

  constructor(private readonly parent: HTMLElement) {
    const settingItem = this.parent.createDiv()
    settingItem.addClass('setting-item')
    const settingItemInfo = settingItem.createDiv()
    settingItemInfo.addClass('setting-item-info')

    const settingItemControl = settingItem.createDiv()
    settingItemControl.addClass('setting-item-control')

    this.authStatusDiv = settingItemInfo.createDiv()
    this.buttonsDiv = settingItemControl
  }

  setNotAuthenticated() {
    this.clear()
    this.authStatusDiv.setText('Not authenticated')
    this.addAuthButton()
  }

  setStatusChecking() {
    this.clear()
    this.authStatusDiv.setText('Checking Imgur authentication...')
  }

  setAuthenticatedAs(currentUser: string) {
    this.clear()
    this.authStatusDiv.setText(`Authenticated as: ${currentUser} ✅`)
    this.addLogoutButton()
  }

  setInternetConnectionProblem() {
    this.clear()
    this.authStatusDiv.setText('Internet connection problem')
  }

  setImgurSessionError(sessionError: string) {
    this.clear()
    this.authStatusDiv.setText(`Imgur session error: ${sessionError}`)
    this.addAuthButton()
  }

  setNotAuthenticatedWithError() {
    this.clear()
    this.authStatusDiv.setText('⚠️ Not authenticated. See console for error')
    this.addAuthButton()
  }

  disableAuthButton() {
    this.authButton?.setDisabled(true)
  }

  enableAuthButton() {
    this.authButton?.setDisabled(false)
  }

  private clear() {
    this.authStatusDiv.empty()
    this.buttonsDiv.empty()
    this.authButton = undefined
  }

  private addLogoutButton() {
    new ButtonComponent(this.buttonsDiv)
      .setButtonText('Logout')
      .setWarning()
      .onClick((e) => this.logoutButtonClick(e))
  }

  private addAuthButton() {
    this.authButton = new ButtonComponent(this.buttonsDiv)
      .setButtonText('Authenticate')
      .setCta()
      .onClick((e) => this.authButtonClick(e))
  }
}
