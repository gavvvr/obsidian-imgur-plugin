type BasicMarkdownImagePieces = Readonly<{
  imgPrefix: string
  imgurhost: string
  imageId: string
  imageExt: string
  startIndex: number
  endIndex: number
}>

type UrlWrappedMarkdownImagePieces = Readonly<
  BasicMarkdownImagePieces & {
    urlPrefix: string
    urlSuffix: string
  }
>

type MarkdownImagePieces = BasicMarkdownImagePieces | UrlWrappedMarkdownImagePieces
export default MarkdownImagePieces

export function isWrapped(img: MarkdownImagePieces): img is UrlWrappedMarkdownImagePieces {
  return 'urlPrefix' in img && 'urlSuffix' in img
}

const IMGUR_IMAGE_ID_LENGTH = 7
const RESIZED_IMGUR_IMAGE_ID_LENGTH = IMGUR_IMAGE_ID_LENGTH + 1

function isImageIdOfExpectedSize(imageId: string) {
  return [IMGUR_IMAGE_ID_LENGTH, RESIZED_IMGUR_IMAGE_ID_LENGTH].includes(imageId.length)
}

export function mdImagePiecesFrom(arr: RegExpMatchArray): MarkdownImagePieces {
  const imageId = arr[4]
  if (!isImageIdOfExpectedSize(imageId)) throw Error('Imgur image id is of unexpcted size')

  return {
    ...(arr[1] && { urlPrefix: arr[1] }),
    imgPrefix: arr[2],
    imgurhost: arr[3],
    imageId: imageId.slice(0, IMGUR_IMAGE_ID_LENGTH),
    imageExt: arr[5],
    ...(arr[6] && { urlSuffix: arr[6] }),
    startIndex: arr.index,
    endIndex: arr.index + arr[0].length,
  }
}
