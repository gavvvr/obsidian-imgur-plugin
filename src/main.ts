/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import * as CodeMirror from "codemirror";
import { ImageUploader, ImgurUploader } from "./imageUploader";
// eslint-disable-next-line import/no-cycle
import ImgurSettingTab from "./ImgurSettingTab";

interface ImgurPluginSettings {
  clientId: string;
}

type Handlers = {
  drop: (cm: CodeMirror.Editor, event: DragEvent) => void;
  paste: (cm: CodeMirror.Editor, event: ClipboardEvent) => void;
};

const DEFAULT_SETTINGS: ImgurPluginSettings = {
  clientId: null,
};

export default class ImgurPlugin extends Plugin {
  private static readonly FAILED_UPLOAD_COMMENT =
    "<!--⚠️Imgur upload failed, check dev console-->";

  settings: ImgurPluginSettings;

  readonly cmAndHandlersMap = new Map<CodeMirror.Editor, Handlers>();

  private imgUploader: ImageUploader;

  private async loadSettings() {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...((await this.loadData()) as ImgurPluginSettings),
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  onunload(): void {
    this.restoreOriginalHandlers();
  }

  private restoreOriginalHandlers() {
    this.cmAndHandlersMap.forEach((originalHandlers, cm) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (cm as any)._handlers.drop[0] = originalHandlers.drop;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (cm as any)._handlers.paste[0] = originalHandlers.paste;
    });
  }

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new ImgurSettingTab(this.app, this));
    this.setupImgurHandlers();
    this.setupImagesUploader();
  }

  setupImagesUploader(): void {
    this.imgUploader = new ImgurUploader(this.settings.clientId);
  }

  private setupImgurHandlers() {
    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      const originalHandlers = this.backupOriginalHandlers(cm);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (cm as any)._handlers.drop[0] = async (
        _: CodeMirror.Editor,
        event: DragEvent
      ) => {
        console.log(_);

        if (!this.settings.clientId) {
          ImgurPlugin.showClientIdNotice();
          originalHandlers.drop(_, event);
          return;
        }

        if (
          event.dataTransfer.types.length !== 1 ||
          event.dataTransfer.types[0] !== "Files"
        ) {
          originalHandlers.drop(_, event);
          return;
        }

        const { files } = event.dataTransfer;
        for (let i = 0; i < files.length; i += 1) {
          if (!files[i].type.startsWith("image")) {
            // using original handlers if at least one of drag-and drop files is not an image
            // It is not possible to call DragEvent.dataTransfer#clearData(images) here
            // to split images and non-images processing
            originalHandlers.drop(_, event);
            return;
          }
        }

        // Adding newline to avoid messing images pasted via default handler
        // with any text added by the plugin
        this.getEditor().replaceSelection("\n");

        const promises: Promise<void>[] = [];
        const filesFailedToUpload: File[] = [];
        for (let i = 0; i < files.length; i += 1) {
          const image = files[i];
          const uploadPromise = this.uploadFileAndEmbedImgurImage(image).catch(
            (e) => {
              console.error(e);
              filesFailedToUpload.push(image);
            }
          );
          promises.push(uploadPromise);
        }

        await Promise.all(promises);

        if (filesFailedToUpload.length === 0) return;

        const newEvt = ImgurPlugin.composeNewDragEvent(
          event,
          filesFailedToUpload
        );
        originalHandlers.drop(_, newEvt);
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (cm as any)._handlers.paste[0] = (
        _: CodeMirror.Editor,
        e: ClipboardEvent
      ) => {
        if (!this.settings.clientId) {
          ImgurPlugin.showClientIdNotice();
          originalHandlers.paste(_, e);
          return;
        }

        const { files } = e.clipboardData;
        if (files.length === 0 || !files[0].type.startsWith("image")) {
          originalHandlers.paste(_, e);
          return;
        }

        for (let i = 0; i < files.length; i += 1) {
          this.uploadFileAndEmbedImgurImage(files[i]).catch((err) => {
            console.error(err);
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(files[i]);
            const newEvt = new ClipboardEvent("paste", {
              clipboardData: dataTransfer,
            });
            originalHandlers.paste(_, newEvt);
          });
        }
      };
    });
  }

  private static composeNewDragEvent(
    originalEvent: DragEvent,
    failedUploads: File[]
  ) {
    const dataTransfer = failedUploads.reduce((dt, fileFailedToUpload) => {
      dt.items.add(fileFailedToUpload);
      return dt;
    }, new DataTransfer());

    return new DragEvent("drop", {
      dataTransfer,
      clientX: originalEvent.clientX,
      clientY: originalEvent.clientY,
    });
  }

  private static showClientIdNotice() {
    const fiveSecondsMillis = 5_000;
    // eslint-disable-next-line no-new
    new Notice(
      "⚠️ Please either set imgur client_id or disable the imgur plugin",
      fiveSecondsMillis
    );
  }

  private backupOriginalHandlers(cm: CodeMirror.Editor) {
    if (!this.cmAndHandlersMap.has(cm)) {
      this.cmAndHandlersMap.set(cm, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        drop: (cm as any)._handlers.drop[0],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        paste: (cm as any)._handlers.paste[0],
      });
    }

    return this.cmAndHandlersMap.get(cm);
  }

  private async uploadFileAndEmbedImgurImage(file: File) {
    const pasteId = (Math.random() + 1).toString(36).substr(2, 5);
    this.insertTemporaryText(pasteId);

    let imgUrl: string;
    try {
      imgUrl = await this.imgUploader.upload(file);
    } catch (e) {
      this.handleFailedUpload(pasteId, e);
      throw e;
    }
    this.embedMarkDownImage(pasteId, imgUrl);
  }

  private insertTemporaryText(pasteId: string) {
    const progressText = ImgurPlugin.progressTextFor(pasteId);
    this.getEditor().replaceSelection(`${progressText}\n`);
  }

  private static progressTextFor(id: string) {
    return `![Uploading file...${id}]()`;
  }

  private embedMarkDownImage(pasteId: string, imageUrl: string) {
    const progressText = ImgurPlugin.progressTextFor(pasteId);
    const markDownImage = `![](${imageUrl})`;

    ImgurPlugin.replaceFirstOccurrence(
      this.getEditor(),
      progressText,
      markDownImage
    );
  }

  private handleFailedUpload(pasteId: string, e: Error) {
    console.error("Failed imgur request: ", e.stack);
    const progressText = ImgurPlugin.progressTextFor(pasteId);
    ImgurPlugin.replaceFirstOccurrence(
      this.getEditor(),
      progressText,
      ImgurPlugin.FAILED_UPLOAD_COMMENT
    );
  }

  private static replaceFirstOccurrence(
    editor: Editor,
    target: string,
    replacement: string
  ) {
    const lines = editor.getValue().split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const ch = lines[i].indexOf(target);
      if (ch !== -1) {
        const from = { line: i, ch };
        const to = { line: i, ch: ch + target.length };
        editor.replaceRange(replacement, from, to);
        break;
      }
    }
  }

  private getEditor(): Editor {
    const mdView = this.app.workspace.activeLeaf.view as MarkdownView;
    return mdView.editor;
  }
}
