import ApiError from 'src/uploader/ApiError'
import { IMGUR_API_BASE } from './constants'
import { AccountInfo, ImgurErrorData, ImgurPostData } from './imgurResponseTypes'

export async function handleImgurErrorResponse(resp: Response): Promise<void> {
  if (resp.headers.get('Content-Type') === 'application/json') {
    throw new ApiError(((await resp.json()) as ImgurErrorData).data.error)
  }
  throw new Error(await resp.text())
}
export default class AuthenticatedImgurClient {
  private readonly accessToken!: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
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

  async upload(image: File): Promise<ImgurPostData> {
    const requestData = new FormData()
    requestData.append('image', image)

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
}
