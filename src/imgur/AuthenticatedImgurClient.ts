import ApiError from 'src/uploader/ApiError'
import { IMGUR_API_BASE } from './constants'
import {
  AccountInfo,
  AlbumResponse,
  Albums,
  ImgurErrorData,
  ImgurPostData,
} from './imgurResponseTypes'

export async function handleImgurErrorResponse(resp: Response): Promise<void> {
  if (resp.headers.get('Content-Type') === 'application/json') {
    throw new ApiError(((await resp.json()) as ImgurErrorData).data.error)
  }
  throw new Error(await resp.text())
}
export default class AuthenticatedImgurClient {
  private readonly accessToken!: string
  private authenticatedUser?: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
    void this.accountInfo()
      .then((r) => (this.authenticatedUser = r.data.url))
      .catch((e) => console.error('Failed to get info about currently authenticated user!', e))
  }

  async accountInfo(): Promise<AccountInfo> {
    const r = await fetch(`${IMGUR_API_BASE}account/me`, {
      headers: new Headers({ Authorization: `Bearer ${this.accessToken}` }),
    })
    if (!r.ok) {
      await handleImgurErrorResponse(r)
    }

    return (await r.json()) as AccountInfo
  }

  async upload(image: File, albumId?: string): Promise<ImgurPostData> {
    const requestData = new FormData()
    requestData.append('image', image)
    if (albumId) {
      requestData.append('album', albumId)
    }

    const resp = await fetch(`${IMGUR_API_BASE}image`, {
      method: 'POST',
      headers: new Headers({ Authorization: `Bearer ${this.accessToken}` }),
      body: requestData,
    })

    if (!resp.ok) {
      await handleImgurErrorResponse(resp)
    }
    return (await resp.json()) as ImgurPostData
  }

  async listAlbums(): Promise<Albums> {
    const r = await fetch(`${IMGUR_API_BASE}account/${this.authenticatedUser}/albums`, {
      headers: new Headers({ Authorization: `Bearer ${this.accessToken}` }),
    })
    if (!r.ok) {
      await handleImgurErrorResponse(r)
    }

    return (await r.json()) as Albums
  }

  async createNewAlbum(name: string, description?: string): Promise<AlbumResponse> {
    const requestData = new FormData()
    requestData.append('title', name)
    if (description) {
      requestData.append('description', description)
    }

    const r = await fetch(`${IMGUR_API_BASE}album`, {
      method: 'POST',
      headers: new Headers({ Authorization: `Bearer ${this.accessToken}` }),
      body: requestData,
    })
    if (!r.ok) {
      await handleImgurErrorResponse(r)
    }

    return (await r.json()) as AlbumResponse
  }
}
