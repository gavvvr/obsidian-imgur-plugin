import { App, Notice, PluginSettingTab, Setting } from 'obsidian'
import { IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY } from '../imgur/constants'
import ImgurPlugin from '../ImgurPlugin'
import ImgurAuthModal from './ImgurAuthModal'
import ImgurAuthenticationStatusItem from './ImgurAuthenticationStatus'

export default class ImgurPluginSettingsTab extends PluginSettingTab {
  plugin: ImgurPlugin

  authModal?: ImgurAuthModal

  authElem?: ImgurAuthenticationStatusItem

  authenticatedUserName?: string = undefined

  constructor(app: App, plugin: ImgurPlugin) {
    super(app, plugin)
    this.plugin = plugin

    this.plugin.registerObsidianProtocolHandler('imgur-oauth', (params) => {
      if (!this.authModal || !this.authModal.isOpen) return

      if (params.error) {
        new Notice(`Authentication failed with error: ${params.error}`)
        return
      }

      const mappedData = params.hash.split('&').map((p) => {
        const sp = p.split('=')
        return [sp[0], sp[1]] as [string, string]
      })
      const map = new Map<string, string>(mappedData)
      localStorage.setItem(
        IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY,
        map.get('access_token'),
      )

      this.plugin.setupImagesUploader()

      this.authModal.close()
      this.authModal = null
    })
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    containerEl.createEl('h2', { text: 'Imgur Plugin settings' })

    new Setting(containerEl).setName('Access Token').addTextArea((textArea) => {
      textArea.setValue(this.plugin.settings.accessToken)
      textArea.onChange((v) => {
        this.plugin.settings.accessToken = v
        this.plugin.setupImagesUploader()
      })
    })
    new Setting(containerEl).setName('Upload Url').addText((text) => {
      text.setValue(this.plugin.settings.uploadUrl)
      text.onChange((v) => {
        this.plugin.settings.uploadUrl = v
        this.plugin.setupImagesUploader()
      })
    })
    new Setting(containerEl).setName('Image show url base').addText((text) => {
      text.setValue(this.plugin.settings.showBase)
      text.onChange((v) => {
        this.plugin.settings.showBase = v
        this.plugin.setupImagesUploader()
      })
    })

    new Setting(containerEl).setName('Confirm before upload').addToggle((t) => {
      t.setValue(this.plugin.settings.showRemoteUploadConfirmation)
      t.onChange((newValue) => {
        this.plugin.settings.showRemoteUploadConfirmation = newValue
      })
    })
    new Setting(containerEl).setName('Enable').addToggle((t) => {
      t.setValue(this.plugin.settings.enable)
      t.onChange((newValue) => {
        this.plugin.settings.enable = newValue
      })
    })
  }

  async hide(): Promise<void> {
    await this.plugin.saveSettings()
    this.plugin.setupImagesUploader()
  }
}
