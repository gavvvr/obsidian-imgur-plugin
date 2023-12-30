export function allFilesAreImages(files: FileList) {
  if (files.length === 0) return false

  for (let i = 0; i < files.length; i += 1) {
    if (!files[i].type.startsWith('image')) return false
  }

  return true
}
