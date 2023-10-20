import { buildMultipartBody } from 'src/utils/multipart-http'
import { describe, expect, it } from 'vitest'

describe('buildMultipartBody', () => {
  it('creates expected result for multiple form data text fields', async () => {
    const expected = `
      --test-multipart-boundary
      Content-Disposition: form-data; name="title"

      Album name
      --test-multipart-boundary
      Content-Disposition: form-data; name="description"

      Some description for album
      --test-multipart-boundary--
    `

    const requestData = new FormData()
    requestData.append('title', 'Album name')
    requestData.append('description', 'Some description for album')
    const boundary = 'test-multipart-boundary'

    const actual = await buildMultipartBody(requestData, boundary).text()

    expect(actual).toBe(cleanup(expected))
  })

  it('creates expected result for File part', async () => {
    const expected = `
      --test-multipart-boundary
      Content-Disposition: form-data; name="file"; filename="example.txt"

      Hello world
      --test-multipart-boundary
      Content-Disposition: form-data; name="description"

      Some description for file
      --test-multipart-boundary--
    `

    const requestData = new FormData()
    requestData.append('file', new File(['Hello world'], 'example.txt'))
    requestData.append('description', 'Some description for file')
    const boundary = 'test-multipart-boundary'

    const actual = await buildMultipartBody(requestData, boundary).text()

    expect(actual).toBe(cleanup(expected))
  })
})

function cleanup(input: string): string {
  return convertToMimeLineEndings(trimWhitespaces(input))

  function convertToMimeLineEndings(input: string): string {
    return input.replace(/\n/g, '\r\n')
  }

  function trimWhitespaces(input: string) {
    return trimSurroundingEmptyLines(trimLeadingWhitespaces(input))
  }

  function trimLeadingWhitespaces(input: string) {
    return input.replace(/  +/g, '')
  }

  function trimSurroundingEmptyLines(input: string) {
    return input.replace(/^\n/, '').replace(/\n$/, '')
  }
}
