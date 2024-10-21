import ObsidianApp from './obsidian-app.page'

class ObsidianSettings {
  async switchToImgurSettingsTab() {
    await $('.vertical-tab-nav-item=Imgur').click()
  }

  async configureClientId(clientId: string) {
    const clientIdInput = await this.findClientIdInput()
    await clientIdInput.setValue(clientId)
  }

  private async findClientIdInput() {
    const clientSettingItem = await $$('div.setting-item').find<WebdriverIO.Element>(
      async (item) => {
        const label = await item.$('.setting-item-info .setting-item-name').getText()
        return label === 'Client ID'
      },
    )
    return clientSettingItem.$('.setting-item-control input[type="text"]')
  }

  async closeSettings() {
    await ObsidianApp.closeModal('Settings')
  }
}

export default new ObsidianSettings()
