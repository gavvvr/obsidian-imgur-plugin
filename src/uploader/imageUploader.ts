export default interface ImageUploader {
  upload(image: File): Promise<string>;
}
