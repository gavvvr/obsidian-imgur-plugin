export interface ImageUploader {
    upload(image: File): Promise<string>
}

export class ImgurUploader implements ImageUploader {
    private readonly clientId!: string
    private static readonly IMGUR_API = 'https://api.imgur.com/3/'

    constructor(clientId: string) {
        this.clientId = clientId
    }

    async upload(image: File): Promise<string> {
        const requestData = new FormData();
        requestData.append('image', image);

        const resp = await fetch(ImgurUploader.IMGUR_API + 'image.json', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Client-ID ' + this.clientId }),
            body: requestData
        })

        if (!resp.ok) {
            throw new Error(await resp.text())
        }
        return (await resp.json()).data.link
    }
}
