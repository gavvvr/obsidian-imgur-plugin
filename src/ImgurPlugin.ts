import {
  CanvasView,
  Editor,
  EditorPosition,
  MarkdownView,
  Menu,
  Notice,
  Plugin,
  ReferenceCache,
  TFile,
  parseLinktext,
} from 'obsidian'
import ImageUploader from './uploader/ImageUploader'
import ImgurPluginSettingsTab from './ui/ImgurPluginSettingsTab'
import ApiError from './uploader/ApiError'
import UploadStrategy from './UploadStrategy'
import buildUploaderFrom from './uploader/imgUploaderFactory'
import RemoteUploadConfirmationDialog from './ui/RemoteUploadConfirmationDialog'
import PasteEventCopy from './aux-event-classes/PasteEventCopy'
import DragEventCopy from './aux-event-classes/DragEventCopy'
import editorCheckCallbackFor from './imgur/resizing/plugin-callback'
import ImgurSize from './imgur/resizing/ImgurSize'
import AuthenticatedImgurClient from './imgur/AuthenticatedImgurClient'
import ImgurAuthenticatedUploader from './uploader/imgur/ImgurAuthenticatedUploader'
import { allFilesAreImages } from './utils/FileList'
import { fixImageTypeIfNeeded } from './utils/misc'
import { createImgurCanvasPasteHandler } from './Canvas'
import { IMGUR_POTENTIALLY_SUPPORTED_FILES_EXTENSIONS } from './imgur/constants'
import { localEmbeddedImageExpectedBoundaries } from './utils/editor'
import UpdateLinksConfirmationModal from './ui/UpdateLinksConfirmationModal'
import InfoModal from './ui/InfoModal'

declare module 'obsidian' {
  interface MarkdownSubView {
    clipboardManager: ClipboardManager
  }

  interface CanvasView extends TextFileView {
    handlePaste: (e: ClipboardEvent) => Promise<void>
  }

  interface Editor {
    getClickableTokenAt(position: EditorPosition): ClickableToken | null
  }

  type ClickableToken = {
    displayText: string
    text: string
    type: string
    start: EditorPosition
    end: EditorPosition
  }
}

interface ClipboardManager {
  handlePaste(e: ClipboardEvent): void
  handleDrop(e: DragEvent): void
}

export interface ImgurPluginSettings {
  uploadStrategy: string
  clientId: string
  showRemoteUploadConfirmation: boolean
  albumToUpload: string | undefined
}

const DEFAULT_SETTINGS: ImgurPluginSettings = {
  uploadStrategy: UploadStrategy.ANONYMOUS_IMGUR.id,
  clientId: null,
  showRemoteUploadConfirmation: true,
  albumToUpload: undefined,
}

export default class ImgurPlugin extends Plugin {
  settings: ImgurPluginSettings

  private imgUploaderField: ImageUploader

  getCurrentImagesUploader(): ImageUploader {
    return this.imgUploaderField
  }

  private customPasteEventCallback = async (
    e: ClipboardEvent,
    _: Editor,
    markdownView: MarkdownView,
  ) => {
    if (e instanceof PasteEventCopy) return

    if (!this.imgUploader) {
      ImgurPlugin.showUnconfiguredPluginNotice()
      return
    }

    const { files } = e.clipboardData

    if (!allFilesAreImages(files)) return

    e.preventDefault()

    if (this.settings.showRemoteUploadConfirmation) {
      const modal = new RemoteUploadConfirmationDialog(this.app)
      modal.open()

      const userResp = await modal.response()
      switch (userResp.shouldUpload) {
        case undefined:
          return
        case true:
          if (userResp.alwaysUpload) {
            this.settings.showRemoteUploadConfirmation = false
            void this.saveSettings()
          }
          break
        case false:
          markdownView.currentMode.clipboardManager.handlePaste(new PasteEventCopy(e))
          return
        default:
          return
      }
    }

    for (let i = 0; i < files.length; i += 1) {
      this.uploadFileAndEmbedImgurImage(files[i]).catch(() => {
        markdownView.currentMode.clipboardManager.handlePaste(new PasteEventCopy(e))
      })
    }
  }

  private customDropEventListener = async (e: DragEvent, _: Editor, markdownView: MarkdownView) => {
    if (e instanceof DragEventCopy) return

    if (!this.imgUploader) {
      ImgurPlugin.showUnconfiguredPluginNotice()
      return
    }

    if (e.dataTransfer.types.length !== 1 || e.dataTransfer.types[0] !== 'Files') {
      return
    }

    // Preserve files before showing modal, otherwise they will be lost from the event
    const { files } = e.dataTransfer

    if (!allFilesAreImages(files)) return

    e.preventDefault()

    if (this.settings.showRemoteUploadConfirmation) {
      const modal = new RemoteUploadConfirmationDialog(this.app)
      modal.open()

      const userResp = await modal.response()
      switch (userResp.shouldUpload) {
        case undefined:
          return
        case true:
          if (userResp.alwaysUpload) {
            this.settings.showRemoteUploadConfirmation = false
            void this.saveSettings()
          }
          break
        case false: {
          markdownView.currentMode.clipboardManager.handleDrop(DragEventCopy.create(e, files))
          return
        }
        default:
          return
      }
    }

    // Adding newline to avoid messing images pasted via default handler
    // with any text added by the plugin
    this.getEditor().replaceSelection('\n')

    const promises: Promise<any>[] = []
    const filesFailedToUpload: File[] = []
    for (let i = 0; i < files.length; i += 1) {
      const image = files[i]
      const uploadPromise = this.uploadFileAndEmbedImgurImage(image).catch(() => {
        filesFailedToUpload.push(image)
      })
      promises.push(uploadPromise)
    }

    await Promise.all(promises)

    if (filesFailedToUpload.length === 0) {
      return
    }

    markdownView.currentMode.clipboardManager.handleDrop(
      DragEventCopy.create(e, filesFailedToUpload),
    )
  }

  private imgurPluginRightClickHandler = (menu: Menu, editor: Editor, view: MarkdownView) => {
    const clickable = editor.getClickableTokenAt(editor.getCursor())

    if (!clickable) return
    if (clickable.type !== 'internal-link') return

    const [localImageExpectedStart, localImageExpectedEnd] =
      localEmbeddedImageExpectedBoundaries(clickable)

    const clickablePrefix = editor.getRange(localImageExpectedStart, clickable.start)
    const clickableSuffix = editor.getRange(clickable.end, localImageExpectedEnd)
    if (clickablePrefix !== '![[' || clickableSuffix !== ']]') return

    const lt = parseLinktext(clickable.text)
    const file = view.app.metadataCache.getFirstLinkpathDest(lt.path, view.file.path)

    if (!IMGUR_POTENTIALLY_SUPPORTED_FILES_EXTENSIONS.includes(file.extension)) return

    menu.addItem((item) => {
      item
        .setTitle('Upload to Imgur')
        .setIcon('wand')
        .onClick(() =>
          this.uploadLocalImageFromEditor(
            editor,
            file,
            localImageExpectedStart,
            localImageExpectedEnd,
          ).then((imageUrl) =>
            this.proposeToReplaceOtherLocalLinksIfAny(file, imageUrl, {
              path: view.file.path,
              startPosition: localImageExpectedStart,
            }),
          ),
        )
    })
  }

  private proposeToReplaceOtherLocalLinksIfAny(
    originalLocalFile: TFile,
    remoteImageUrl: string,
    originalReference: { path: string; startPosition: EditorPosition },
  ) {
    const otherReferencesByNote = this.getAllCachedReferencesForFile(originalLocalFile)
    removeReferenceToOriginalNoteIfPresent(otherReferencesByNote, originalReference)

    const notesWithSameLocalFile = Object.keys(otherReferencesByNote)
    if (notesWithSameLocalFile.length === 0) return

    this.showLinksUpdateDialog(originalLocalFile, remoteImageUrl, otherReferencesByNote)
  }

  private getAllCachedReferencesForFile(file: TFile) {
    const allLinks = this.app.metadataCache.resolvedLinks

    const notesWithLinks = []
    for (const [notePath, noteLinks] of Object.entries(allLinks)) {
      for (const [linkName] of Object.entries(noteLinks)) {
        if (linkName === file.name) notesWithLinks.push(notePath)
      }
    }

    const linksByNote = notesWithLinks.reduce(
      (acc, note) => {
        const noteMetadata = this.app.metadataCache.getCache(note)
        const noteLinks = noteMetadata.embeds
        if (noteLinks) {
          acc[note] = noteLinks.filter((l) => l.link === file.name)
        }
        return acc
      },
      {} as Record<string, ReferenceCache[]>,
    )
    return linksByNote
  }

  private showLinksUpdateDialog(
    localFile: TFile,
    remoteImageUrl: string,
    otherReferencesByNote: Record<string, ReferenceCache[]>,
  ) {
    const stats = getFilesAndLinksStats(otherReferencesByNote)
    const dialogBox = new UpdateLinksConfirmationModal(this.app, localFile.path, stats)
    dialogBox.onDoNotUpdateClick(() => dialogBox.close())
    dialogBox.onDoUpdateClick(() => {
      dialogBox.disableButtons()
      dialogBox.setContent('Working...')
      this.replaceAllLocalReferencesWithRemoteOne(otherReferencesByNote, remoteImageUrl)
        .catch((e) => {
          new InfoModal(
            this.app,
            'Error',
            'Unexpected error occurred, check Developer Tools console for details',
          ).open()
          console.error('Something bad happened during links update', e)
        })
        .finally(() => dialogBox.close())
      new Notice(`Updated ${stats.linksCount} links in ${stats.filesCount} files`)
    })
    dialogBox.open()
  }

  private async replaceAllLocalReferencesWithRemoteOne(
    referencesByNotes: Record<string, ReferenceCache[]>,
    remoteImageUrl: string,
  ) {
    for (const [notePath, refs] of Object.entries(referencesByNotes)) {
      const noteFile = this.app.vault.getFileByPath(notePath)
      const refsStartOffsetsSortedDescending = refs
        .map((ref) => ({
          start: ref.position.start.offset,
          end: ref.position.end.offset,
        }))
        .sort((ref1, ref2) => ref2.start - ref1.start)

      await this.app.vault.process(noteFile, (noteContent) => {
        let updatedContent = noteContent
        refsStartOffsetsSortedDescending.forEach((refPos) => {
          updatedContent =
            updatedContent.substring(0, refPos.start) +
            `![](${remoteImageUrl})` +
            updatedContent.substring(refPos.end)
        })
        return updatedContent
      })
    }
  }

  private async uploadLocalImageFromEditor(
    editor: Editor,
    file: TFile,
    start: EditorPosition,
    end: EditorPosition,
  ) {
    const arrayBuffer = await this.app.vault.readBinary(file)
    const fileToUpload = new File([arrayBuffer], file.name)
    editor.replaceRange('\n', end, end)
    const imageUrl = await this.uploadFileAndEmbedImgurImage(fileToUpload, {
      ch: 0,
      line: end.line + 1,
    })
    editor.replaceRange(`<!--${editor.getRange(start, end)}-->`, start, end)
    return imageUrl
  }

  get imgUploader(): ImageUploader {
    return this.imgUploaderField
  }

  private async loadSettings() {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...((await this.loadData()) as ImgurPluginSettings),
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }

  async onload(): Promise<void> {
    await this.loadSettings()
    this.addSettingTab(new ImgurPluginSettingsTab(this.app, this))

    this.setupImagesUploader()
    this.setupImgurHandlers()
    this.addResizingCommands()
  }

  setupImagesUploader(): void {
    const uploader = buildUploaderFrom(this.settings)
    this.imgUploaderField = uploader
    if (!uploader) return

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalUploadFunction = uploader.upload
    uploader.upload = function (image: File, albumId?: string) {
      if (!uploader) return
      return originalUploadFunction.call(uploader, fixImageTypeIfNeeded(image), albumId)
    }
  }

  private setupImgurHandlers() {
    this.registerEvent(this.app.workspace.on('editor-paste', this.customPasteEventCallback))
    this.registerEvent(this.app.workspace.on('editor-drop', this.customDropEventListener))
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', (leaf) => {
        const view = leaf.view

        if (view.getViewType() === 'canvas') {
          this.overridePasteHandlerForCanvasView(view as CanvasView)
        }
      }),
    )

    this.registerEvent(this.app.workspace.on('editor-menu', this.imgurPluginRightClickHandler))
  }

  private overridePasteHandlerForCanvasView(view: CanvasView) {
    const originalPasteFn = view.handlePaste
    view.handlePaste = createImgurCanvasPasteHandler(this, originalPasteFn)
  }

  private addResizingCommands() {
    const sizes = ImgurSize.values()
    for (const size of sizes) {
      this.addCommand({
        id: `imgur-resize-${size.suffix}-command`,
        name: `Resize to ${size.description}${size.sizeHint ? ` (${size.sizeHint})` : ''}`,
        editorCheckCallback: editorCheckCallbackFor(size),
      })
    }
  }

  getAuthenticatedImgurClient(): AuthenticatedImgurClient | null {
    if (this.imgUploader instanceof ImgurAuthenticatedUploader) {
      return this.imgUploader.client
    }

    return null
  }

  private static showUnconfiguredPluginNotice() {
    const fiveSecondsMillis = 5_000
    new Notice('⚠️ Please configure Imgur plugin or disable it', fiveSecondsMillis)
  }

  private async uploadFileAndEmbedImgurImage(file: File, atPos?: EditorPosition) {
    const pasteId = (Math.random() + 1).toString(36).substring(2, 7)
    this.insertTemporaryText(pasteId, atPos)

    let imgUrl: string
    try {
      imgUrl = await this.imgUploaderField.upload(file, this.settings.albumToUpload)
    } catch (e) {
      if (e instanceof ApiError) {
        this.handleFailedUpload(
          pasteId,
          `Upload failed, remote server returned an error: ${e.message}`,
        )
      } else {
        console.error('Failed imgur request: ', e)
        this.handleFailedUpload(pasteId, '⚠️Imgur upload failed, check dev console')
      }
      throw e
    }
    this.embedMarkDownImage(pasteId, imgUrl)
    return imgUrl
  }

  private insertTemporaryText(pasteId: string, atPos?: EditorPosition) {
    const progressText = ImgurPlugin.progressTextFor(pasteId)
    const replacement = `${progressText}\n`
    const editor = this.getEditor()
    if (atPos) {
      editor.replaceRange(replacement, atPos, atPos)
    } else {
      this.getEditor().replaceSelection(replacement)
    }
  }

  private static progressTextFor(id: string) {
    return `![Uploading file...${id}]()`
  }

  private embedMarkDownImage(pasteId: string, imageUrl: string) {
    const progressText = ImgurPlugin.progressTextFor(pasteId)
    const markDownImage = `![](${imageUrl})`

    ImgurPlugin.replaceFirstOccurrence(this.getEditor(), progressText, markDownImage)
  }

  private handleFailedUpload(pasteId: string, message: string) {
    const progressText = ImgurPlugin.progressTextFor(pasteId)
    ImgurPlugin.replaceFirstOccurrence(this.getEditor(), progressText, `<!--${message}-->`)
  }

  private getEditor(): Editor {
    const mdView = this.app.workspace.getActiveViewOfType(MarkdownView)
    return mdView.editor
  }

  private static replaceFirstOccurrence(editor: Editor, target: string, replacement: string) {
    const lines = editor.getValue().split('\n')
    for (let i = 0; i < lines.length; i += 1) {
      const ch = lines[i].indexOf(target)
      if (ch !== -1) {
        const from = { line: i, ch }
        const to = { line: i, ch: ch + target.length }
        editor.replaceRange(replacement, from, to)
        break
      }
    }
  }
}

function removeReferenceToOriginalNoteIfPresent(
  otherReferencesByNote: Record<string, ReferenceCache[]>,
  originalNote: { path: string; startPosition: EditorPosition },
) {
  if (!Object.keys(otherReferencesByNote).includes(originalNote.path)) return

  const refsFromOriginalNote = otherReferencesByNote[originalNote.path]
  const originalRefStart = originalNote.startPosition
  const refForExclusion = refsFromOriginalNote.find(
    (r) =>
      r.position.start.line === originalRefStart.line &&
      r.position.start.col === originalRefStart.ch,
  )
  if (refForExclusion) {
    refsFromOriginalNote.remove(refForExclusion)
    if (refsFromOriginalNote.length === 0) {
      delete otherReferencesByNote[originalNote.path]
    }
  }
}

function getFilesAndLinksStats(otherReferencesByNote: Record<string, ReferenceCache[]>) {
  return {
    filesCount: Object.keys(otherReferencesByNote).length,
    linksCount: Object.values(otherReferencesByNote).reduce(
      (count, refs) => count + refs.length,
      0,
    ),
  }
}
