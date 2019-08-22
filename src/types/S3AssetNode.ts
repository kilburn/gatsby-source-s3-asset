export default interface S3AssetNode {
  id: string
  LastModified: Date
  ETag: string
  Key: string
  internal: {
    content: string
    contentDigest: string
    mediaType: string
    type: string
  }
}
