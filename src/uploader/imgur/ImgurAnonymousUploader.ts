import { IMGUR_API_BASE } from 'src/imgur/constants'
import { ImgurPostData } from '../../imgur/imgurResponseTypes'
import ImageUploader from '../ImageUploader'
import { handleImgurErrorResponse } from '../../imgur/AuthenticatedImgurClient'
import { requestUrl } from 'obsidian'
import prepareMultipartRequestPiece from 'src/utils/obsidian-http-client'

export default class ImgurAnonymousUploader implements ImageUploader {
  private readonly clientId!: string

  constructor(clientId: string) {
    this.clientId = clientId
  }

  async upload(image: File): Promise<string> {
    const requestData = new FormData()
    requestData.append('image', image)

    const request = {
      url: `${IMGUR_API_BASE}image`,
      method: 'POST',
      headers: { Authorization: `Client-ID ${this.clientId}` },
      ...(await prepareMultipartRequestPiece(requestData)),
      throw: false,
    }

    const resp = await requestUrl(request)

    if (resp.status >= 400) {
      handleImgurErrorResponse(resp)
    }
    return (resp.json as ImgurPostData).data.link
  }
}
