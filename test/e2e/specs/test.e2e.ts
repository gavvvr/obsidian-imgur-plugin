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

  context('Note with existing imgur image', () => {
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

  context('Note with existing local image', () => {
    it('resize the image', async () => {
      await ObsidianApp.putExampleImageToVault('example-local-image.png')
      await ObsidianApp.createNewNoteWithContent('![[example-local-image.png]]')
      await MockingUtils.mockUploadedImageUrl('https://i.imgur.com/sXTI69E.png')

      const somewhereWithinMarkdownImage = { line: 0, ch: 5 }
      await ObsidianApp.setCursorPositionInActiveNote(somewhereWithinMarkdownImage)

      await ObsidianApp.uploadToImgurUsingCommandPalette()

      const noteContent = await ObsidianApp.getTextFromOpenedNote()
      const expectedContent = [
        '<!--![[example-local-image.png]]-->',
        '![](https://i.imgur.com/sXTI69E.png)',
        '',
      ].join('\n')
      await expect(noteContent).toBe(expectedContent)
    })
  })
})
