export default interface S3AssetNode {
  id: string
  LastModified: Date
  ETag: string
  Key: string
  Metadata: { [k: string]: string }
  internal: {
    content: string
    contentDigest: string
    mediaType: string
    type: string
  }
}
