import { ButtonComponent } from "obsidian";
import {
  IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY,
  IMGUR_PLUGIN_CLIENT_ID,
} from "src/imgur/constants";
import ApiError from "src/uploader/ApiError";
import ImgurAuthenticatedUploader from "src/uploader/imgur/ImgurAuthenticatedUploader";
import ImgurAuthModal from "./ImgurAuthModal";
// eslint-disable-next-line import/no-cycle
import ImgurPluginSettingsTab from "./ImgurPluginSettingsTab";

export default class ImgurAuthenticationStatus {
  private authenticated: boolean;

  private authStatusDiv: HTMLDivElement;

  private buttonsDiv: HTMLDivElement;

  constructor(
    private readonly parent: HTMLElement,
    private readonly settingsTab: ImgurPluginSettingsTab
  ) {}

  async display(): Promise<void> {
    const settingItem = this.parent.createDiv();
    settingItem.addClass("setting-item");
    const settingItemInfo = settingItem.createDiv();
    settingItemInfo.addClass("setting-item-info");

    const settingItemControl = settingItem.createDiv();
    settingItemControl.addClass("setting-item-control");

    this.authStatusDiv = settingItemInfo.createDiv();
    this.buttonsDiv = settingItemControl;

    await this.updateAll();
  }

  private async updateAll() {
    this.authStatusDiv.empty();
    this.buttonsDiv.empty();
    await this.updateStatus();
    this.drawButtons();
  }

  private async updateStatus() {
    const uploader = this.getAuthenticatedUploader();
    if (!uploader) {
      this.setNotAuthenticated();
      return;
    }

    this.authStatusDiv.setText("Checking Imgur authentication...");
    try {
      const currentUserName = (await uploader.client.accountInfo()).data.url;
      this.authStatusDiv.setText(`Authenticated as: ${currentUserName} ✅`);
      this.authenticated = true;
    } catch (e) {
      if (e instanceof TypeError && e.message === "Failed to fetch") {
        this.authStatusDiv.setText("Internet connection problem");
      } else if (e instanceof ApiError) {
        this.authStatusDiv.setText(`Imgur session error: ${e.message}`);
      } else {
        // eslint-disable-next-line no-console
        console.warn("Not authenticated, exception: ", e);
        this.setNotAuthenticated();
      }
    }
  }

  private getAuthenticatedUploader(): ImgurAuthenticatedUploader | null {
    if (
      this.settingsTab.plugin.imgUploader &&
      this.settingsTab.plugin.imgUploader instanceof ImgurAuthenticatedUploader
    ) {
      return this.settingsTab.plugin.imgUploader;
    }

    return null;
  }

  private setNotAuthenticated() {
    this.authStatusDiv.setText("Not authenticated");
    this.authenticated = false;
  }

  private drawButtons() {
    if (this.authenticated) {
      this.addLogoutButton(this.buttonsDiv);
    } else {
      this.addAuthButton(this.buttonsDiv);
    }
  }

  private addLogoutButton(el: HTMLElement) {
    new ButtonComponent(el)
      .setButtonText("Logout")
      .setWarning()
      .onClick(async () => {
        localStorage.removeItem(IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY);

        this.settingsTab.plugin.setupImagesUploader();
        await this.updateAll();
      });
  }

  private addAuthButton(parentEl: HTMLElement) {
    new ButtonComponent(parentEl)
      .setButtonText("Authenticate")
      .setCta()
      .onClick(() => {
        const modal = new ImgurAuthModal(
          IMGUR_PLUGIN_CLIENT_ID,
          this.settingsTab.app,
          async () => {
            await this.updateAll();
          }
        );
        modal.open();
        this.settingsTab.authModal = modal;
      });
  }
}
