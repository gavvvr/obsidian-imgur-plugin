import { Editor, MarkdownView, Notice, Plugin } from 'obsidian'
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

declare module 'obsidian' {
  interface MarkdownSubView {
    clipboardManager: ClipboardManager
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
}

const DEFAULT_SETTINGS: ImgurPluginSettings = {
  uploadStrategy: UploadStrategy.ANONYMOUS_IMGUR.id,
  clientId: null,
  showRemoteUploadConfirmation: true,
}

function allFilesAreImages(files: FileList) {
  if (files.length === 0) return false

  for (let i = 0; i < files.length; i += 1) {
    if (!files[i].type.startsWith('image')) return false
  }

  return true
}

export default class ImgurPlugin extends Plugin {
  settings: ImgurPluginSettings

  private imgUploaderField: ImageUploader

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

    const promises: Promise<void>[] = []
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
    const sizes = ImgurSize.values()
    for (let i = 0; i < sizes.length; i += 1) {
      const size = sizes[i]
      this.addCommand({
        id: `imgur-resize-${size.suffix}-command`,
        name: `Resize to ${size.description}${size.sizeHint ? ` (${size.sizeHint})` : ''}`,
        editorCheckCallback: editorCheckCallbackFor(size),
      })
    }
    await this.loadSettings()
    this.addSettingTab(new ImgurPluginSettingsTab(this.app, this))
    this.setupImgurHandlers()
    this.setupImagesUploader()
  }

  setupImagesUploader(): void {
    this.imgUploaderField = buildUploaderFrom(this.settings)
  }

  private setupImgurHandlers() {
    this.registerEvent(this.app.workspace.on('editor-paste', this.customPasteEventCallback))
    this.registerEvent(this.app.workspace.on('editor-drop', this.customDropEventListener))
  }

  private static showUnconfiguredPluginNotice() {
    const fiveSecondsMillis = 5_000
    new Notice('⚠️ Please configure Imgur plugin or disable it', fiveSecondsMillis)
  }

  private async uploadFileAndEmbedImgurImage(file: File) {
    const pasteId = (Math.random() + 1).toString(36).substr(2, 5)
    this.insertTemporaryText(pasteId)

    let imgUrl: string
    try {
      imgUrl = await this.imgUploaderField.upload(file)
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
  }

  private insertTemporaryText(pasteId: string) {
    const progressText = ImgurPlugin.progressTextFor(pasteId)
    this.getEditor().replaceSelection(`${progressText}\n`)
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
    const mdView = this.app.workspace.activeLeaf.view as MarkdownView
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
