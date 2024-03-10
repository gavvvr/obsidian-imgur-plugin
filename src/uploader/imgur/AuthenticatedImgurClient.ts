import { RequestUrlResponse, requestUrl } from 'obsidian'

import ApiError from 'src/uploader/ApiError'
import { IMGUR_API_BASE } from './constants'
import {
  AccountInfo,
  AlbumResponse,
  Albums,
  ImgurErrorData,
  ImgurPostData,
} from './imgurResponseTypes'
import prepareMultipartRequestPiece from 'src/utils/obsidian-http-client'

export function handleImgurErrorResponse(resp: RequestUrlResponse): void {
  if (resp.headers['Content-Type'] === 'application/json') {
    throw new ApiError((resp.json as ImgurErrorData).data.error)
  }
  throw new Error(resp.text)
}

export default class AuthenticatedImgurClient {
  private readonly accessToken!: string
  private authenticatedUser?: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
    void this.accountInfo()
      .then((r) => (this.authenticatedUser = r.data.url))
      .catch((e) =>
        console.error(
          'Failed to get info about currently authenticated user!',
          e,
        ),
      )
  }

  async accountInfo(): Promise<AccountInfo> {
    const req = {
      url: `${IMGUR_API_BASE}/account/me`,
      method: 'GET',
      headers: { Authorization: `Bearer ${this.accessToken}` },
      throw: false,
    }

    const resp = await requestUrl(req)

    if (resp.status >= 400) {
      handleImgurErrorResponse(resp)
    }

    return resp.json as AccountInfo
  }

  async upload(image: File, albumId?: string): Promise<ImgurPostData> {
    const requestData = new FormData()
    requestData.append('image', image)
    if (albumId) {
      requestData.append('album', albumId)
    }

    const request = {
      url: `${IMGUR_API_BASE}/image`,
      method: 'POST',
      headers: { Authorization: `Bearer ${this.accessToken}` },
      ...(await prepareMultipartRequestPiece(requestData)),
      throw: false,
    }

    const resp = await requestUrl(request)

    if (resp.status >= 400) {
      handleImgurErrorResponse(resp)
    }
    return resp.json as ImgurPostData
  }

  async listAlbums(): Promise<Albums> {
    const req = {
      url: `${IMGUR_API_BASE}/account/${this.authenticatedUser}/albums`,
      method: 'GET',
      headers: { Authorization: `Bearer ${this.accessToken}` },
      throw: false,
    }

    const resp = await requestUrl(req)

    if (resp.status >= 400) {
      handleImgurErrorResponse(resp)
    }

    return resp.json as Albums
  }

  async createNewAlbum(
    name: string,
    description?: string,
  ): Promise<AlbumResponse> {
    const requestData = new FormData()
    requestData.append('title', name)
    if (description) {
      requestData.append('description', description)
    }

    const request = {
      url: `${IMGUR_API_BASE}/album`,
      method: 'POST',
      headers: { Authorization: `Bearer ${this.accessToken}` },
      ...(await prepareMultipartRequestPiece(requestData)),
      throw: false,
    }

    const resp = await requestUrl(request)

    if (resp.status >= 400) {
      handleImgurErrorResponse(resp)
    }

    return resp.json as AlbumResponse
  }
}
