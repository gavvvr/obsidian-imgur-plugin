export default class ImgurSize {
  private static VALUES: ImgurSize[] = []

  private constructor(
    readonly suffix: string,
    readonly description: string,
    readonly sizeHint?: string,
  ) {
    ImgurSize.VALUES.push(this)
  }

  static values() {
    return ImgurSize.VALUES
  }

  toString() {
    return this.description
  }

  static SMALL_SQUARE = new ImgurSize('s', 'Small square', '90x90')

  static BIG_SQUARE = new ImgurSize('b', 'Big square', '160x160')

  static SMALL_THUMBNAIL = new ImgurSize('t', 'Small Thumbnail', '160x160')

  static MEDIUM_THUMBNAIL = new ImgurSize('m', 'Medium Thumbnail', '320x320')

  static LARGE_THUMBNAIL = new ImgurSize('l', 'Large Thumbnail', '640x640')

  static HUGE_THUMBNAIL = new ImgurSize('h', 'Huge Thumbnail', '1024x1024')

  static ORIGINAL = new ImgurSize('', 'Original size')
}
