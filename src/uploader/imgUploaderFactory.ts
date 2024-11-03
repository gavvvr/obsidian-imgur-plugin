import { ImgurPluginSettings } from '../ImgurPlugin'
import AuthenticatedImgurClient from '../imgur/AuthenticatedImgurClient'
import { IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY } from '../imgur/constants'
import ImageUploader from './ImageUploader'
import ImgurAnonymousUploader from './imgur/ImgurAnonymousUploader'
import ImgurAuthenticatedUploader from './imgur/ImgurAuthenticatedUploader'

export default function buildUploaderFrom(
  settings: ImgurPluginSettings,
): ImageUploader | undefined {
  if (settings.uploadStrategy === 'AUTHENTICATED_IMGUR') {
    const accessToken = localStorage.getItem(IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY)

    if (!accessToken) {
      return undefined
    }

    return new ImgurAuthenticatedUploader(new AuthenticatedImgurClient(accessToken))
  } else if (settings.uploadStrategy === 'ANONYMOUS_IMGUR') {
    if (settings.clientId) {
      return new ImgurAnonymousUploader(settings.clientId)
    } else {
      return undefined
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const exhaustiveCheck: never = settings.uploadStrategy
  }
}
