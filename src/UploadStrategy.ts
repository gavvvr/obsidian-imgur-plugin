export const UploadStrategies = {
  ANONYMOUS_IMGUR: 'Anonymous Imgur upload',
  AUTHENTICATED_IMGUR: 'Authenticated Imgur upload',
} as const

export type UploadStrategy = keyof typeof UploadStrategies
