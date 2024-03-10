import { App, PluginSettingTab, Setting } from 'obsidian'
import ImgurPlugin from '../ImgurPlugin'
import ImgurAuthModal from './ImgurAuthModal'

export default class ImgurPluginSettingsTab extends PluginSettingTab {
  plugin: ImgurPlugin

  authModal?: ImgurAuthModal

  authenticatedUserName?: string = undefined

  constructor(app: App, plugin: ImgurPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    containerEl.createEl('h1', { text: 'ImageLinker Settings' })

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
