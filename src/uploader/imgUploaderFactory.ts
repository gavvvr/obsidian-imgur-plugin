import { IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY } from 'src/imgur/constants'
import AuthenticatedImgurClient from 'src/imgur/AuthenticatedImgurClient'
import { ImgurPluginSettings } from 'src/ImgurPlugin'
import UploadStrategy from 'src/UploadStrategy'
import ImageUploader from './ImageUploader'
import ImgurAnonymousUploader from './imgur/ImgurAnonymousUploader'
import ImgurAuthenticatedUploader from './imgur/ImgurAuthenticatedUploader'

export default function buildUploaderFrom(
  settings: ImgurPluginSettings,
): ImageUploader | undefined {
  if (UploadStrategy.AUTHENTICATED_IMGUR.id === settings.uploadStrategy) {
    const accessToken = localStorage.getItem(IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY)

    if (!accessToken) {
      return undefined
    }

    return new ImgurAuthenticatedUploader(new AuthenticatedImgurClient(accessToken))
  }
  if (settings.uploadStrategy === UploadStrategy.ANONYMOUS_IMGUR.id) {
    if (settings.clientId) {
      return new ImgurAnonymousUploader(settings.clientId)
    } else {
      return undefined
    }
  }
  throw Error('This line of code should never be reached')
}
