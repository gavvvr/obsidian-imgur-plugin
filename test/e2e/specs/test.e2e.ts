import ObsidianApp from './pageobjects/obsidian-app.page'
import MockingUtils from './utils/mocking'

describe('Electron Testing', () => {
  before(async () => {
    const settings = await ObsidianApp.openSettings()
    await settings.switchToImgurSettingsTab()
    await settings.configureClientId('test-client-id')
    await settings.closeSettings()
  })

  context('blank note', () => {
    it('uploads clipboard image on PASTE shortcut', async () => {
      await ObsidianApp.createNewNote()

      await MockingUtils.mockUploadedImageUrl('https://i.imgur.com/w88wB4I.png')

      await ObsidianApp.loadSampleImageToClipboard()
      await ObsidianApp.pasteFromClipboard()
      await ObsidianApp.confirmUpload()

      const noteContent = await ObsidianApp.getTextFromOpenedNote()
      await expect(noteContent).toBe('![](https://i.imgur.com/w88wB4I.png)\n')
    })
  })

  context('Note with existing image', () => {
    it('resize the image', async () => {
      await ObsidianApp.createNewNoteWithContent('![](https://i.imgur.com/JGnCrC9.png)')

      const somewhereWithinMarkdownImage = { line: 0, ch: 2 }
      await ObsidianApp.setCursorPositionInActiveNote(somewhereWithinMarkdownImage)

      await ObsidianApp.resizeToSmallThumbnailUsingCommandPalette()

      const noteContent = await ObsidianApp.getTextFromOpenedNote()
      await expect(noteContent).toBe(
        '[![](https://i.imgur.com/JGnCrC9t.png)](https://i.imgur.com/JGnCrC9.png)',
      )
    })
  })
})
