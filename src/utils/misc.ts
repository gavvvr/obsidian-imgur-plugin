function fixImageTypeIfNeeded(image: File) {
  if (passesInstanceofCheck(image)) {
    return image
  }
  return new File([image], image.name, { type: image.type, lastModified: image.lastModified })

  function passesInstanceofCheck(image: File): boolean {
    return image instanceof File
  }
}

export { fixImageTypeIfNeeded }
