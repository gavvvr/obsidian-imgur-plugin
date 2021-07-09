export interface ImageUploader {
  upload(image: File): Promise<string>;
}
