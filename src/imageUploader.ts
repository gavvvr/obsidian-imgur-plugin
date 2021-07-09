import ApiError from "./ApiError";

export interface ImageUploader {
  upload(image: File): Promise<string>;
}

export class ImgurUploader implements ImageUploader {
  private readonly clientId!: string;

  private static readonly IMGUR_API = "https://api.imgur.com/3/";

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  async upload(image: File): Promise<string> {
    const requestData = new FormData();
    requestData.append("image", image);

    const resp = await fetch(`${ImgurUploader.IMGUR_API}image.json`, {
      method: "POST",
      headers: new Headers({ Authorization: `Client-ID ${this.clientId}` }),
      body: requestData,
    });

    if (!resp.ok) {
      if (resp.headers.get("Content-Type") === "application/json") {
        throw new ApiError(((await resp.json()) as ImgurErrorData).data.error);
      }
      throw new Error(await resp.text());
    }
    return ((await resp.json()) as ImgurPostData).data.link;
  }
}

type ImgurErrorData = {
  success: boolean;
  status: number;
  data: {
    request: string;
    method: string;
    error: string;
  };
};

type ImgurPostData = {
  success: boolean;
  status: number;
  data: {
    datetime: number;
    id: string;
    link: string;
    deletehash: string;

    size: number;
    width: number;
    height: number;

    type: string;
    animated: boolean;
    has_sound: boolean;
  };
};
