export default class UploadStrategy {
  private static readonly valuesArr: UploadStrategy[] = []

  static get values(): readonly UploadStrategy[] {
    return this.valuesArr
  }

  static readonly ANONYMOUS_IMGUR = new UploadStrategy('ANONYMOUS_IMGUR', 'Anonymous Imgur upload')

  static readonly AUTHENTICATED_IMGUR = new UploadStrategy(
    'AUTHENTICATED_IMGUR',
    'Authenticated Imgur upload',
  )

  private constructor(
    readonly id: string,
    readonly description: string,
  ) {
    UploadStrategy.valuesArr.push(this)
  }
}
