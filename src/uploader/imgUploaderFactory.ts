import { IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY, IMGUR_PLUGIN_CLIENT_ID } from 'src/imgur/constants'
import ImgurClient from 'src/imgur/ImgurClient'
import { ImgurPluginSettings } from 'src/ImgurPlugin'
import ImageUploader from './ImageUploader'
import ImgurAnonymousUploader from './imgur/ImgurAnonymousUploader'
import ImgurAuthenticatedUploader from './imgur/ImgurAuthenticatedUploader'

function defaultAnonymousUploader(): ImageUploader {
  return new ImgurAnonymousUploader(IMGUR_PLUGIN_CLIENT_ID)
}

export default function buildUploaderFrom(
  settings: ImgurPluginSettings,
): ImageUploader | undefined {
  if (settings.uploadStrategy === 'AUTHENTICATED_IMGUR') {
    const accessToken = localStorage.getItem(IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY)

    if (!accessToken) {
      return undefined
    }

    return new ImgurAuthenticatedUploader(new ImgurClient(accessToken))
  } else if (settings.uploadStrategy === 'ANONYMOUS_IMGUR') {
    if (settings.clientId) {
      return new ImgurAnonymousUploader(settings.clientId)
    }
    return defaultAnonymousUploader()
  } else {
    const _: never = settings.uploadStrategy
    return
  }
  throw Error('This line of code should never be reached')
}
