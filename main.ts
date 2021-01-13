import {App, MarkdownView, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {Editor} from "codemirror";

interface ImgurPluginSettings {
    clientId: string;
}

const DEFAULT_SETTINGS: ImgurPluginSettings = {
    clientId: null
}

export default class ImgurPlugin extends Plugin {
    settings: ImgurPluginSettings;
    readonly cmAndHandlersMap = new Map;

    async loadSettings() {
        this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {
        this.restoreOriginalHandlers();
    }

    restoreOriginalHandlers() {
        this.cmAndHandlersMap.forEach((originalHandler, cm) => {
            cm._handlers.paste[0] = originalHandler;
        })
    }

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new ImgurSettingTab(this.app, this));
        this.setupImgurPasteHandler();
    }

    setupImgurPasteHandler() {
        this.registerCodeMirror((cm: any) => {
            let originalPasteHandler = this.backupOriginalPasteHandler(cm);

            cm._handlers.paste[0] = (_: any, e: ClipboardEvent) => {
                if (!this.settings.clientId) {
                    console.warn("Please either set imgur client id or disable the plugin");
                    return originalPasteHandler(_, e);
                }

                let files = e.clipboardData.files;
                if (files.length === 0 || !files[0].type.startsWith("image")) {
                    return originalPasteHandler(_, e);
                }

                for (let i = 0; i < files.length; i++) {
                    this.uploadFileAndEmbedImgurImage(files[i]).catch(console.error);
                }
            };
        });
    }

    backupOriginalPasteHandler(cm: any) {
        if (!this.cmAndHandlersMap.has(cm)) {
            let originalHandler = cm._handlers.paste[0];
            this.cmAndHandlersMap.set(cm, originalHandler);
        }

        return this.cmAndHandlersMap.get(cm);
    }

    async uploadFileAndEmbedImgurImage(file: File) {
        let pasteId = (Math.random() + 1).toString(36).substr(2, 5);
        this.insertTemporaryText(pasteId);

        try {
            let resp = await this.uploadFile(file);
            if (!resp.ok) {
                let err = {response: resp, body: await resp.text()};
                this.handleFailedUpload(pasteId, err)
                return
            }
            let json = await resp.json();
            this.embedMarkDownImage(pasteId, json)
        } catch (e) {
            this.handleFailedUpload(pasteId, e)
        }
    }

    insertTemporaryText(pasteId: string) {
        let progressText = ImgurPlugin.progressTextFor(pasteId);
        this.getEditor().replaceSelection(progressText + "\n");
    }

    private static progressTextFor(id: string) {
        return `![Uploading file...${id}]()`
    }

    uploadFile(file: File) {
        const data = new FormData();
        data.append('image', file);

        return fetch('https://api.imgur.com/3/image.json', {
            method: 'POST',
            headers: new Headers({'Authorization': 'Client-ID ' + this.settings.clientId}),
            body: data
        });
    }

    embedMarkDownImage(pasteId: string, jsonResponse: any) {
        let imageUrl = jsonResponse.data.link;

        let progressText = ImgurPlugin.progressTextFor(pasteId);
        let markDownImage = `![](${imageUrl})`;

        ImgurPlugin.replaceFirstOccurrence(this.getEditor(), progressText, markDownImage);
    };

    handleFailedUpload(pasteId: string, reason: any) {
        console.error("Failed imgur request: ", reason);
        let progressText = ImgurPlugin.progressTextFor(pasteId);
        ImgurPlugin.replaceFirstOccurrence(this.getEditor(), progressText, "⚠️Imgur upload failed, check dev console");
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
        let view = this.app.workspace.activeLeaf.view as MarkdownView;
        return view.sourceMode.cmEditor;
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
