export default interface S3AssetNode {
  id: string
  LastModified: Date
  ETag: string
  Key: string
  url: string
  Metadata: { [k: string]: string }
  internal: {
    mediaType: string
    type: 'S3Asset'
  }
}
