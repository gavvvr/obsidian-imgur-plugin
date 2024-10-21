import { App } from 'obsidian'

import { IMGUR_PLUGIN_ID } from '../../constants'

class MockingUtils {
  async mockUploadedImageUrl(mockedUrl: string) {
    await browser.execute(
      (imgurPluginId: typeof IMGUR_PLUGIN_ID, uploadedImageUrl: string) => {
        // @ts-expect-error 'app' exists in Obsidian
        declare const app: App
        const uploadStub = () => Promise.resolve(uploadedImageUrl)
        app.plugins.plugins[imgurPluginId].imgUploader.upload = uploadStub
      },
      IMGUR_PLUGIN_ID,
      mockedUrl,
    )
  }
}

export default new MockingUtils()
