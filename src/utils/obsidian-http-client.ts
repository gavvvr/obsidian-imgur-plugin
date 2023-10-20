import { buildMultipartBody } from './multipart-http'

export default async function prepareMultipartRequestPiece(requestData: FormData) {
  const boundary = `----formdata-0${`${Math.floor(Math.random() * 1e11)}`.padStart(11, '0')}`

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: await buildMultipartBody(requestData, boundary).arrayBuffer(),
  }
}
