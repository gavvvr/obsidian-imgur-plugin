export function allFilesAreImages(files: FileList) {
  if (files.length === 0) return false

  for (const file of files) {
    if (!file.type.startsWith('image')) return false
  }

  return true
}
