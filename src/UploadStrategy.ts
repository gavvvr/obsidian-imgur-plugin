export type UploadStrategy = 'ANONYMOUS_IMGUR' | 'AUTHENTICATED_IMGUR'

export type StrategyAndDescription = Record<UploadStrategy, string>

export const UploadStrategies: StrategyAndDescription = {
  ANONYMOUS_IMGUR: 'Anonymous Imgur upload',
  AUTHENTICATED_IMGUR: 'Authenticated Imgur upload',
}
