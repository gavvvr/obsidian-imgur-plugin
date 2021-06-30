import { App, PluginSettingTab, Setting } from "obsidian";
// eslint-disable-next-line import/no-cycle
import ImgurPlugin from "./main";

export default class ImgurSettingTab extends PluginSettingTab {
  plugin: ImgurPlugin;

  constructor(app: App, plugin: ImgurPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl("h2", { text: "imgur.com plugin settings" });
    new Setting(containerEl)
      .setName("Client ID")
      .setDesc(ImgurSettingTab.clientIdSettingDescription())
      .addText((text) =>
        text
          .setPlaceholder("Enter your client_id")
          .setValue(this.plugin.settings.clientId)
          .onChange(async (value) => {
            this.plugin.settings.clientId = value;
            this.plugin.setupImagesUploader();
            await this.plugin.saveSettings();
          })
      );
  }

  private static clientIdSettingDescription() {
    const registerClientUrl = "https://api.imgur.com/oauth2/addclient";

    const fragment = document.createDocumentFragment();
    const a = document.createElement("a");
    a.textContent = registerClientUrl;
    a.setAttribute("href", registerClientUrl);
    fragment.append("Obtained from ");
    fragment.append(a);
    return fragment;
  }
}
