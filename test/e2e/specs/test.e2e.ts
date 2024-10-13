import * as fs from 'fs'
import { Key } from 'webdriverio'
import ImgurPlugin from '../../../src/ImgurPlugin'
import { App } from 'obsidian'

const TEST_VAULT_DIR = 'test/e2e/e2e_test_vault'
const IMGUR_PLUGIN_ID = 'obsidian-imgur-plugin'

describe('Electron Testing', () => {
  before(async () => {
    removeTestVaultFromPreviousTestRun()
    await createAndOpenFreshTestVaultWithImgurPlugin()
    await switchToMainVaultWindow()
    await $('button=Trust author and enable plugins').click()
    await pressCloseButtonOn('Trust vault modal')
    await activateImgurPlugin()
  })

  context('blank note', () => {
    it('uploads clipboard image on PASTE shortcut', async () => {
      await configureClientId()
      await browser.execute((imgurPluginId: typeof IMGUR_PLUGIN_ID) => {
        // @ts-expect-error 'app' exists in Obsidian
        declare const app: App
        const uploadStub = () => Promise.resolve('https://i.imgur.com/w88wB4I.png')
        app.plugins.plugins[imgurPluginId].imgUploader.upload = uploadStub
      }, IMGUR_PLUGIN_ID)

      await createNewNoteAndFocusOnIt()

      await loadSampleImageToClipboard()

      await pasteFromClipboard()
      await confirmImageUpload()

      await expect(await getTextFromOpenedNote()).toBe('![](https://i.imgur.com/w88wB4I.png)\n')
    })
  })
})

const removeTestVaultFromPreviousTestRun = () => {
  fs.rmSync(TEST_VAULT_DIR, { force: true, recursive: true })
}

const createAndOpenFreshTestVaultWithImgurPlugin = async () => {
  await browser.execute((testVaultDir: typeof TEST_VAULT_DIR) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ipcRenderer } = require('electron')
    const shouldCreateNewVault = true
    ipcRenderer.sendSync('vault-open', testVaultDir, shouldCreateNewVault)
  }, TEST_VAULT_DIR)

  const targetPluginsDir = `${TEST_VAULT_DIR}/.obsidian/plugins/${IMGUR_PLUGIN_ID}/`
  fs.mkdirSync(targetPluginsDir, { recursive: true })
  fs.copyFileSync('manifest.json', `${targetPluginsDir}/manifest.json`)
  fs.copyFileSync('main.js', `${targetPluginsDir}/main.js`)
}

const switchToMainVaultWindow = async () => {
  await browser.switchWindow('app://obsidian.md/index.html')
}

const pressCloseButtonOn = async (whatIsBeingClosed: string) => {
  console.log(`Closing '${whatIsBeingClosed}'`)

  const closeButton = $('.modal-close-button')
  await closeButton.click()
}

const activateImgurPlugin = async () => {
  await browser.execute((imgurPluginId: typeof IMGUR_PLUGIN_ID) => {
    // @ts-expect-error 'app' exists in Obsidian
    declare const app: App
    app.plugins.setEnable(true)
    app.plugins.enablePlugin(imgurPluginId)
  }, IMGUR_PLUGIN_ID)
}

const configureClientId = async () => {
  await openImgurPluginSettingsTab()

  const clientIdInputSetting = await findClientIdInputSetting()
  await clientIdInputSetting.setValue('test-client-id')

  await pressCloseButtonOn('Settings')
}

const openImgurPluginSettingsTab = async () => {
  await browser.execute(openObsidianSettings)
  // switch to Imgur settings tab
  await $('.vertical-tab-nav-item=Imgur').click()
}

const findClientIdInputSetting = async () => {
  const clientSettingItem = await $$('div.setting-item').find<WebdriverIO.Element>(async (item) => {
    const label = await item.$('.setting-item-info .setting-item-name').getText()
    return label === 'Client ID'
  })
  return clientSettingItem.$('.setting-item-control input[type="text"]')
}

const createNewNoteAndFocusOnIt = async () => {
  const newNoteButton = $('aria/New note')
  await newNoteButton.click()

  const note = $('.cm-contentContainer div[role="textbox"]')
  await note.click()
}

const loadSampleImageToClipboard = async () => {
  await browser.execute(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { nativeImage, clipboard } = require('electron')
    const imageBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+' +
      'l2Z/dAAAAM0lEQVR4nGP4/5/h/1+' +
      'G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC'
    const dataUrl = 'data:image/png;base64,' + imageBase64
    const sampleImage = nativeImage.createFromDataURL(dataUrl)
    clipboard.writeImage(sampleImage)
  })
}

const pasteFromClipboard = async () => {
  await browser.keys([Key.Ctrl, 'v'])
}

const confirmImageUpload = async () => {
  await $('button=Upload').click()
}

const getTextFromOpenedNote = async () => {
  return await browser.execute(() => {
    // @ts-expect-error 'app' exists in Obsidian
    declare const app: App
    return app.workspace.activeEditor!.editor!.getValue()
  })
}

declare module 'obsidian' {
  interface App {
    plugins: {
      plugins: {
        [index: string]: Plugin
        [IMGUR_PLUGIN_ID]: ImgurPlugin
      }
      setEnable(toggle: boolean): void
      enablePlugin(pluginId: string): void
    }
    commands: {
      executeCommandById: (id: string) => boolean
    }
  }
}

const openObsidianSettings = () => {
  // @ts-expect-error 'app' exists in Obsidian
  declare const app: App
  app.commands.executeCommandById('app:open-settings')
}
