import * as fs from 'fs'
import { Key } from 'webdriverio'
import clipboard from 'clipboardy'

const TEST_VAULT_DIR = 'test/e2e/e2e_test_vault'
const IMGUR_PLUGIN_ID = 'obsidian-imgur-plugin'

describe('Electron Testing', () => {
  before(async () => {
    removeTestVaultFromPreviousTestRun()
    await createAndOpenFreshTestVaultWithImgurPlugin()
    await focusOnVaultOpenedWindow()
    await activateImgurPlugin()
  })

  context('blank note', () => {
    it('uploads clipboard image on PASTE shortcut', async () => {
      await browser.execute(
        `app.plugins.plugins['${IMGUR_PLUGIN_ID}'].imgUploader.upload = () => Promise.resolve('https://i.imgur.com/w88wB4I.png')`,
      )

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
  const shouldCreateNewVault = true
  await browser.execute(
    `require('electron').ipcRenderer.sendSync('vault-open', '${TEST_VAULT_DIR}', ${shouldCreateNewVault})`,
  )

  const targetPluginsDir = `${TEST_VAULT_DIR}/.obsidian/plugins/${IMGUR_PLUGIN_ID}/`
  fs.mkdirSync(targetPluginsDir, { recursive: true })
  fs.copyFileSync('manifest.json', `${targetPluginsDir}/manifest.json`)
  fs.copyFileSync('main.js', `${targetPluginsDir}/main.js`)
}

const focusOnVaultOpenedWindow = async () => {
  const lastWindow = (await browser.getWindowHandles()).at(0)
  try {
    await browser.switchWindow(lastWindow!)
  } catch (e) {
    // doing nothing... it throws, but it does switch the window
  }
}

const activateImgurPlugin = async () => {
  await browser.execute(
    `app.plugins.setEnable(true);app.plugins.enablePlugin('${IMGUR_PLUGIN_ID}')`,
  )
  await $('.modal-close-button').then((button) => button.click())
}

const createNewNoteAndFocusOnIt = async () => {
  const newNoteButton = await $('aria/New note')
  await newNoteButton.click()

  const note = await $('.cm-contentContainer div[role="textbox"]')
  await note.click()
}

const loadSampleImageToClipboard = async () => {
  await browser.execute(
    "const {nativeImage, clipboard} = require('electron'); clipboard.writeImage(nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC'))",
  )
}

const pasteFromClipboard = async () => {
  await browser.keys([Key.Ctrl, 'v'])
}

const confirmImageUpload = async () => {
  await (await $('button=Upload')).click()
}

const getTextFromOpenedNote = async () => {
  await browser.execute(
    "const {clipboard} = require('electron');clipboard.writeText(app.workspace.activeEditor.editor.getValue())",
  )

  return clipboard.readSync()
}
