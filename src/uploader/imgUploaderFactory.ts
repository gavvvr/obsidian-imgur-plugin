import { ImgurPluginSettings } from 'src/ImgurPlugin'
import ImageUploader from './ImageUploader'
import ImgurAuthenticatedUploader from './imgur/ImgurAuthenticatedUploader'

export default function buildUploaderFrom(
  settings: ImgurPluginSettings,
): ImageUploader | undefined {
  if (settings.uploadUrl && settings.showBase && settings.accessToken) {
    return new ImgurAuthenticatedUploader(settings)
  }

  throw Error('This line of code should never be reached')
}
