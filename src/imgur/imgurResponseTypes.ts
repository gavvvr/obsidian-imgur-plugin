export interface ImgurErrorData {
  success: boolean
  status: number
  data: {
    request: string
    method: string
    error: string
  }
}

export interface AccountInfo {
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

export interface ImgurPostData {
  success: boolean
  status: number
  data: {
    datetime: number
    id: string
    link: string
    deletehash: string

    size: number
    width: number
    height: number

    type: string
    animated: boolean
    has_sound: boolean
  }
}

export interface Albums {
  success: boolean
  status: number
  data: AlbumInfo[]
}

export interface AlbumResponse {
  success: boolean
  status: number
  data: AlbumInfo
}

export interface AlbumInfo {
  id: string
  title: string
  privacy: 'public' | 'hidden'
  datetime: number
}
