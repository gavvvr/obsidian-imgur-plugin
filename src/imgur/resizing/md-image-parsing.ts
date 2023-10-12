import MarkdownImagePieces, { mdImagePiecesFrom } from './MarkdownImagePieces'

const imgurImageRegexp =
  /(\[)?(!\[[^[\]]*]\()(https?:\/\/(?:i\.)?imgur\.com\/)(\w+)\.(png|jpe?g|gif)\)(]\(https?:\/\/(?:i\.)?imgur\.com\/\w+\.(?:png|jpe?g|gif)\))?/gm

const parseImgurImages = (line: string): IterableIterator<RegExpMatchArray> =>
  line.matchAll(imgurImageRegexp)

const isMatchUnderCursor = (match: RegExpMatchArray, cursorPosition: number): boolean =>
  cursorPosition >= match.index && cursorPosition < match.index + match[0].length

type MatchResult = Readonly<{
  exists: boolean
  mdImagePieces: MarkdownImagePieces
}>

class MatchWrapper implements MatchResult {
  constructor(private match?: RegExpMatchArray) {}

  get exists(): boolean {
    return !!this.match
  }

  get mdImagePieces(): MarkdownImagePieces {
    return mdImagePiecesFrom(this.match)
  }
}

const findImgurMarkdownImage = (str: string, cursorPosOnStr: number): MatchResult => {
  const allMatchedOnStr = parseImgurImages(str)
  const matchUnderCursor = Array.from(allMatchedOnStr).find((match) =>
    isMatchUnderCursor(match, cursorPosOnStr),
  )
  return new MatchWrapper(matchUnderCursor)
}

export default findImgurMarkdownImage
