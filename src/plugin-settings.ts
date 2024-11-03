import { UploadStrategy } from './UploadStrategy'

export interface ImgurPluginSettings {
  uploadStrategy: UploadStrategy
  clientId: string
  showRemoteUploadConfirmation: boolean
  albumToUpload: string | undefined
}

export const DEFAULT_SETTINGS: ImgurPluginSettings = {
  uploadStrategy: 'ANONYMOUS_IMGUR',
  clientId: null,
  showRemoteUploadConfirmation: true,
  albumToUpload: undefined,
}
