import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { App, EditorPosition } from 'obsidian'
import { Key } from 'webdriverio'

import { IMGUR_PLUGIN_ID, TEST_VAULT_DIR } from '../../constants'
import CanvasCard from './canvas-card.page'
import ObsidianSettings from './obsidian-settings.page'

const EXAMPLE_PNG_IMAGE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+' +
  'l2Z/dAAAAM0lEQVR4nGP4/5/h/1+' +
  'G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC'

class ObsidianApp {
  async removeE2eTestVaultIfExists() {
    await fs.rm(TEST_VAULT_DIR, { force: true, recursive: true })
  }

  async openDevTools() {
    await browser.execute(() => {
      /* eslint-disable */
      // @ts-ignore
      const electronWindow = require('electron').remote.BrowserWindow.getFocusedWindow()
      electronWindow.openDevTools({ mode: 'bottom' })
      /* eslint-enable */
    })
  }

  async createAndOpenFreshVault() {
    await browser.execute((testVaultDir: string) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ipcRenderer } = require('electron')
      const shouldCreateNewVault = true
      ipcRenderer.sendSync('vault-open', testVaultDir, shouldCreateNewVault)
    }, TEST_VAULT_DIR)

    const targetPluginsDir = `${TEST_VAULT_DIR}/.obsidian/plugins/${IMGUR_PLUGIN_ID}/`
    await fs.mkdir(targetPluginsDir, { recursive: true })
    await fs.copyFile('manifest.json', `${targetPluginsDir}/manifest.json`)
    await fs.copyFile('main.js', `${targetPluginsDir}/main.js`)

    await this.switchToMainWindow()
    await $('button=Trust author and enable plugins').click()
    await this.closeModal('Trust vault modal')
  }

  private async switchToMainWindow() {
    await browser.switchWindow('app://obsidian.md/index.html')
  }

  async activateImgurPlugin() {
    await this.activatePlugin(IMGUR_PLUGIN_ID)
  }

  private async activatePlugin(pluginId: string) {
    await browser.execute((imgurPluginId: string) => {
      // @ts-expect-error 'app' exists in Obsidian
      declare const app: App
      app.plugins.setEnable(true)
      app.plugins.enablePlugin(imgurPluginId)
    }, pluginId)
  }

  async closeModal(modalName: string) {
    console.log(`Closing '${modalName}'`)
    await $('.modal-close-button').click()
  }

  async openSettings() {
    await browser.execute(() => {
      // @ts-expect-error 'app' exists in Obsidian
      declare const app: App
      app.commands.executeCommandById('app:open-settings')
    })
    return ObsidianSettings
  }

  async createNewNoteWithContent(content: string) {
    await this.doCreateNewNote(content)
  }

  async createNewEmptyCanvas() {
    await $('aria/Create new canvas').click()
    await $('.workspace-leaf.mod-active .view-content').click()
  }

  async findAndSwitchToCanvasCard() {
    await browser.switchFrame(await $('iframe').getElement())
    return CanvasCard
  }

  async createNewNote() {
    await this.doCreateNewNote()
  }

  private async doCreateNewNote(content?: string) {
    const newNoteButton = $('aria/New note')
    await newNoteButton.click()

    const noteContent = $('.workspace-leaf.mod-active .cm-contentContainer')
    await noteContent.click()
    if (content) {
      await browser.execute((content: string) => {
        // @ts-expect-error 'app' exists in Obsidian
        declare const app: App
        app.workspace.activeEditor!.editor!.setValue(content)
      }, content)
    }
  }

  async resizeToSmallThumbnailUsingCommandPalette() {
    await this.openCommandPalette()
    await this.fuzzySearchResizeToSmallThumbnail()
    await this.hitEnter()
  }

  async uploadToImgurUsingCommandPalette() {
    await this.openCommandPalette()
    await browser.keys('Upload to Imgur')
    await this.hitEnter()
  }

  private async openCommandPalette() {
    await browser.keys([Key.Ctrl, 'p'])
  }

  private async fuzzySearchResizeToSmallThumbnail() {
    await browser.keys('resize small thumb')
  }

  private async hitEnter() {
    await browser.keys(Key.Enter)
  }

  async getTextFromOpenedNote() {
    return await browser.execute(() => {
      // @ts-expect-error 'app' exists in Obsidian
      declare const app: App
      return app.workspace.activeEditor!.editor!.getValue()
    })
  }

  async setCursorPositionInActiveNote(position: EditorPosition) {
    await browser.execute((position: EditorPosition) => {
      // @ts-expect-error 'app' exists in Obsidian
      declare const app: App
      app.workspace.activeEditor!.editor!.setCursor(position)
    }, position)
  }

  async loadSampleImageToClipboard() {
    await browser.execute((imageBase64: string) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { nativeImage, clipboard } = require('electron')
      const dataUrl = 'data:image/png;base64,' + imageBase64
      const sampleImage = nativeImage.createFromDataURL(dataUrl)
      clipboard.writeImage(sampleImage)
    }, EXAMPLE_PNG_IMAGE_BASE64)
  }

  async putExampleImageToVault(pathRelativeToVault: string) {
    const imageBuffer = Buffer.from(EXAMPLE_PNG_IMAGE_BASE64, 'base64')
    await fs.writeFile(path.join(TEST_VAULT_DIR, pathRelativeToVault), imageBuffer)
  }

  async pasteFromClipboard() {
    await browser.keys([Key.Ctrl, 'v'])
  }

  async confirmUpload() {
    await $('button=Upload').click()
  }

  async confirmReplacingAllLinks() {
    await $('//div[@class="modal"]//button[text()="Yes"]').click()
  }
}

export default new ObsidianApp()
