import { ImgurPluginSettings } from 'src/ImgurPlugin'

import ImageUploader from '../ImageUploader'
import { ImgurPostData } from 'src/uploader/imgur/imgurResponseTypes'
import { requestUrl } from 'obsidian'
import prepareMultipartRequestPiece from 'src/utils/obsidian-http-client'
import { handleImgurErrorResponse } from 'src/uploader/imgur/AuthenticatedImgurClient'

export default class ImgurAuthenticatedUploader implements ImageUploader {
  settings: ImgurPluginSettings

  constructor(settings: ImgurPluginSettings) {
    this.settings = settings
  }

  async upload(image: File, albumId?: string): Promise<string> {
    const res: ImgurPostData = await this.request(image, albumId)
    if (res.code == 200) {
      const id = res.data.id
      return `${this.settings.showBase}?id=${id}`
    }
  }

  async request(image: File, albumId?: string): Promise<ImgurPostData> {
    const requestData = new FormData()
    requestData.append('image', image)
    if (albumId) {
      requestData.append('album', albumId)
    }

    const request = {
      url: this.settings.uploadUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${this.settings.accessToken}` },
      ...(await prepareMultipartRequestPiece(requestData)),
      throw: false,
    }

    const resp = await requestUrl(request)

    if (resp.status >= 400) {
      handleImgurErrorResponse(resp)
    }
    return resp.json as ImgurPostData
  }
}
