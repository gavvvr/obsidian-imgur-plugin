import {App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {ImageUploader, ImgurUploader} from "./imageUploader";

interface ImgurPluginSettings {
    clientId: string;
}

const DEFAULT_SETTINGS: ImgurPluginSettings = {
    clientId: null
}

export default class ImgurPlugin extends Plugin {
    private static readonly FAILED_UPLOAD_COMMENT = "<!--⚠️Imgur upload failed, check dev console-->";

    settings: ImgurPluginSettings;
    readonly cmAndHandlersMap = new Map;
    private imgUploader: ImageUploader

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {
        this.restoreOriginalHandlers();
    }

    restoreOriginalHandlers() {
        this.cmAndHandlersMap.forEach((originalHandlers, cm) => {
            cm._handlers.drop[0] = originalHandlers.drop;
            cm._handlers.paste[0] = originalHandlers.paste;
        })
    }

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new ImgurSettingTab(this.app, this));
        this.setupImgurHandlers();
        this.setupImagesUploader();
    }

    setupImagesUploader() {
        this.imgUploader = new ImgurUploader(this.settings.clientId);
    }

    setupImgurHandlers() {
        this.registerCodeMirror((cm: any) => {
            let originalHandlers = this.backupOriginalHandlers(cm);

            cm._handlers.drop[0] = async (_: any, e: DragEvent) => {
                if (!this.settings.clientId) {
                    ImgurPlugin.showClientIdNotice();
                    return originalHandlers.drop(_, e);
                }

                if (e.dataTransfer.types.length !== 1 || e.dataTransfer.types[0] !== "Files") {
                    return originalHandlers.drop(_, e);
                }

                let files = e.dataTransfer.files;
                for (let i = 0; i < files.length; i++) {
                    if (!files[i].type.startsWith("image")) {
                        // using original handlers if at least one of drag-and drop files is not an image
                        // It is not possible to call DragEvent.dataTransfer#clearData(images) here
                        // to split images and non-images processing
                        return originalHandlers.drop(_, e);
                    }
                }

                // Adding newline to avoid messing images pasted via default handler
                // with any text added by the plugin
                this.getEditor().replaceSelection("\n");

                let promises: Promise<void>[] = []
                let failedUploads: File[] = []
                for (let i = 0; i < files.length; i++) {
                    const image = files[i];
                    let uploadPromise = this.uploadFileAndEmbedImgurImage(image)
                        .catch(e => { console.log(e); failedUploads.push(image) })
                    promises.push(uploadPromise)
                }

                for (let promise of promises) {
                    try {
                        await promise
                    } catch (e) {
                        console.log(e)
                    }
                }

                if (failedUploads.length === 0) return

                const dataTransfer = new DataTransfer();
                for (const fileFailedToUpload of failedUploads) {
                    dataTransfer.items.add(fileFailedToUpload)
                }
                const newEvt = new DragEvent('drop', {
                    dataTransfer: dataTransfer,
                    clientX: e.clientX,
                    clientY: e.clientY,
                })
                originalHandlers.drop(_, newEvt)
            };

            cm._handlers.paste[0] = (_: any, e: ClipboardEvent) => {
                if (!this.settings.clientId) {
                    ImgurPlugin.showClientIdNotice();
                    return originalHandlers.paste(_, e);
                }

                let files = e.clipboardData.files;
                if (files.length === 0 || !files[0].type.startsWith("image")) {
                    return originalHandlers.paste(_, e);
                }

                for (let i = 0; i < files.length; i++) {
                    this.uploadFileAndEmbedImgurImage(files[i])
                        .catch(err => {
                            console.error(err)
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(files[i])
                            const newEvt = new ClipboardEvent('paste', {clipboardData: dataTransfer})
                            originalHandlers.paste(_, newEvt)
                        });
                }
            };
        });
    }

    private static showClientIdNotice() {
        const fiveSecondsMillis = 5_000
        new Notice("⚠️ Please either set imgur client_id or disable the imgur plugin", fiveSecondsMillis)
    }

    backupOriginalHandlers(cm: any) {
        if (!this.cmAndHandlersMap.has(cm)) {
            let originalDropHandler = cm._handlers.drop[0];
            let originalPasteHandler = cm._handlers.paste[0];
            this.cmAndHandlersMap.set(cm, {drop: originalDropHandler, paste: originalPasteHandler});
        }

        return this.cmAndHandlersMap.get(cm);
    }

    async uploadFileAndEmbedImgurImage(file: File) {
        let pasteId = (Math.random() + 1).toString(36).substr(2, 5);
        this.insertTemporaryText(pasteId);

        let imgUrl: string;
        try {
            imgUrl = await this.imgUploader.upload(file);
        } catch (e) {
            this.handleFailedUpload(pasteId, e)
            throw e
        }
        this.embedMarkDownImage(pasteId, imgUrl)
    }

    insertTemporaryText(pasteId: string) {
        let progressText = ImgurPlugin.progressTextFor(pasteId);
        this.getEditor().replaceSelection(progressText + "\n");
    }

    private static progressTextFor(id: string) {
        return `![Uploading file...${id}]()`
    }

    embedMarkDownImage(pasteId: string, imageUrl: string) {
        let progressText = ImgurPlugin.progressTextFor(pasteId);
        let markDownImage = `![](${imageUrl})`;

        ImgurPlugin.replaceFirstOccurrence(this.getEditor(), progressText, markDownImage);
    };

    handleFailedUpload(pasteId: string, reason: any) {
        console.error("Failed imgur request: ", reason);
        let progressText = ImgurPlugin.progressTextFor(pasteId);
        ImgurPlugin.replaceFirstOccurrence(this.getEditor(), progressText, ImgurPlugin.FAILED_UPLOAD_COMMENT);
    };

    static replaceFirstOccurrence(editor: Editor, target: string, replacement: string) {
        let lines = editor.getValue().split('\n');
        for (let i = 0; i < lines.length; i++) {
            let ch = lines[i].indexOf(target);
            if (ch != -1) {
                let from = {line: i, ch: ch};
                let to = {line: i, ch: ch + target.length};
                editor.replaceRange(replacement, from, to);
                break;
            }
        }
    }

    getEditor(): Editor {
        let mdView = this.app.workspace.activeLeaf.view as MarkdownView;
        return mdView.editor;
    }
}

class ImgurSettingTab extends PluginSettingTab {
    plugin: ImgurPlugin;

    constructor(app: App, plugin: ImgurPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let {containerEl} = this;

        containerEl.empty();
        containerEl.createEl('h2', {text: 'imgur.com plugin settings'});
        new Setting(containerEl)
            .setName('Client ID')
            .setDesc(this.clientIdSettingDescription())
            .addText(text => text.setPlaceholder('Enter your client_id')
                .setValue(this.plugin.settings.clientId)
                .onChange(async (value) => {
                    this.plugin.settings.clientId = value;
                    this.plugin.setupImagesUploader();
                    await this.plugin.saveSettings();
                }));
    }

    clientIdSettingDescription() {
        const registerClientUrl = "https://api.imgur.com/oauth2/addclient";

        let fragment = document.createDocumentFragment();
        let a = document.createElement('a');
        a.textContent = registerClientUrl
        a.setAttribute("href", registerClientUrl);
        fragment.append("Obtained from ");
        fragment.append(a);
        return fragment;
    }
}
