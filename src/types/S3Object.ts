export interface S3Object {
  Key: string
  ETag: string
  Metadata: { [k: string]: string }
}
