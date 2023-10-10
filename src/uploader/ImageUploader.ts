export default interface ImageUploader {
  upload(image: File, albumId?: string): Promise<string>
}
