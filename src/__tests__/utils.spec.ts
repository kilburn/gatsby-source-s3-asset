import { constructS3UrlForAsset, getNodeFields } from '../utils'

describe('utils', () => {
  test('constructS3UrlForAsset: AWS', () => {
    const s3Url: string = constructS3UrlForAsset({
      bucketName: 'jesse.pics',
      domain: 's3.amazonaws.com',
      region: 'us-east-1',
      key: 'my_image.jpg',
    })
    expect(s3Url).toBe(
      'https://jesse.pics.s3.us-east-1.amazonaws.com/my_image.jpg'
    )
  })

  test('constructS3UrlForAsset: third-party implementation', () => {
    const customUrl = constructS3UrlForAsset({
      bucketName: 'js-bucket',
      domain: 'minio.jesses.io',
      key: 'my_image.jpg',
      protocol: 'https',
    })
    expect(customUrl).toBe('https://minio.jesses.io/js-bucket/my_image.jpg')
  })

  test('constructS3UrlForAsset: custom public domain', () => {
    const customUrl = constructS3UrlForAsset({
      bucketName: 'js-bucket',
      domain: 'minio.jesses.io',
      publicDomain: 'test.tld',
      key: 'my_image.jpg',
      protocol: 'https',
    })
    expect(customUrl).toBe('https://test.tld/my_image.jpg')
  })

  test('constructS3UrlForAsset: invalid input', () => {
    expect(() => {
      // Invalid params -- `key` is required.
      constructS3UrlForAsset({
        bucketName: 'js-bucket',
        domain: 'minio.jesses.io',
        protocol: 'http',
      } as {
        bucketName: string
        domain: string
        protocol: string
        key: string
      })
    }).toThrow()
  })

  test('Verify getNodeFields utils func.', () => {
    const ETag = '"833816655f9709cb1b2b8ac9505a3c65"'
    const Key = '2019-04-10/DSC02943.jpg'
    const Metadata = {}
    const entity = { ETag, Key, Metadata }
    const url = constructS3UrlForAsset({
      bucketName: 'js-bucket',
      domain: 'minio.jesses.io',
      publicDomain: 'test.tld',
      key: 'my_image.jpg',
      protocol: 'https',
    })
    const nodeFields = getNodeFields(entity, url)

    expect(nodeFields).toEqual({
      Key,
      ETag: '833816655f9709cb1b2b8ac9505a3c65',
      url,
      Metadata,
    })
  })
})
