import ImgurSize from './ImgurSize'
import MarkdownImagePieces, { isWrapped as isUrlWrapped } from './MarkdownImagePieces'

const resizeTo = (size: ImgurSize) => (pieces: MarkdownImagePieces) => {
  let replacement
  const resizedUrl = `${pieces.imgPrefix}${pieces.imgurhost}${pieces.imageId}${size.suffix}.${pieces.imageExt})`

  if (size === ImgurSize.ORIGINAL) {
    replacement = resizedUrl
  } else if (isUrlWrapped(pieces)) {
    replacement = `${pieces.urlPrefix}${resizedUrl}${pieces.urlSuffix}`
  } else {
    replacement = `[${resizedUrl}](${pieces.imgurhost}${pieces.imageId}.${pieces.imageExt})`
  }

  return {
    content: replacement,
    from: pieces.startIndex,
    to: pieces.endIndex,
  }
}

export default resizeTo
