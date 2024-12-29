import { UploadStrategy } from './UploadStrategy'

export interface ImgurPluginSettings {
  uploadStrategy: UploadStrategy
  clientId: string | undefined
  showRemoteUploadConfirmation: boolean
  albumToUpload: string | undefined
}

export const DEFAULT_SETTINGS: ImgurPluginSettings = {
  uploadStrategy: 'ANONYMOUS_IMGUR',
  clientId: undefined,
  showRemoteUploadConfirmation: true,
  albumToUpload: undefined,
}
