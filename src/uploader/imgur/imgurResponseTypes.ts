export type ImgurErrorData = {
  success: boolean
  status: number
  data: {
    request: string
    method: string
    error: string
  }
}

export type AccountInfo = {
  success: boolean
  status: number
  data: {
    id: number
    created: number

    url: string
    bio: string
    avatar: string
    avatar_name: string
    cover: string
    cover_name: string
    reputation: number
    reputation_name: string

    pro_expiration: boolean

    user_flow: {
      status: boolean
    }

    is_blocked: boolean
  }
}

export type ImgurPostData = {
  msg: string
  code: number
  data: {
    data: string
    fieldName: string
    filename: string
    id: number
    mimeType: string
    userId: number
  }
}

export type Albums = {
  success: boolean
  status: number
  data: Array<AlbumInfo>
}

export type AlbumResponse = {
  success: boolean
  status: number
  data: AlbumInfo
}

export type AlbumInfo = {
  id: string
  title: string
  privacy: 'public' | 'hidden'
  datetime: number
}
