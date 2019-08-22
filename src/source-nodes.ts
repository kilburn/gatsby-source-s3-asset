import { S3 } from 'aws-sdk'
import {
  constructS3UrlForAsset,
  createS3AssetNode,
  createS3Instance,
} from './utils'

// =================
// Type definitions.
// =================
export interface SourceS3Options {
  // NOTE: Required params.
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  // Defaults to `${bucketName}.s3.amazonaws.com`, but may be overridden to
  // e.g., support CDN's (such as CloudFront), or any other S3-compliant API
  // (such as DigitalOcean Spaces.)
  domain?: string
  region?: string
  // Defaults to HTTP.
  protocol?: string
}

/**
 * Recursively fetches all items from the given bucket,
 * making multiple requests if necessary
 *
 * @param bucketName name of the bucket to fetch
 * @param s3 s3 client to use
 */
const fetchBucketItems = async (bucketName: string, s3: S3) => {
  const s3Entities: S3.ObjectList = []
  let nextContinuationToken: undefined | string = undefined
  while (true) {
    const listObjectsResponse = await s3
      .listObjectsV2({
        Bucket: bucketName,
        ContinuationToken: nextContinuationToken,
      })
      .promise()
    s3Entities.push.apply(s3Entities, listObjectsResponse.Contents || [])
    if (!listObjectsResponse.IsTruncated) {
      return s3Entities
    }
    nextContinuationToken = listObjectsResponse.NextContinuationToken
  }
}

export const sourceNodes = async (
  { actions, createNodeId, createContentDigest },
  {
    // ================
    accessKeyId,
    secretAccessKey,
    bucketName,
    // ================
    domain = 's3.amazonaws.com',
    region = 'us-east-1',
    protocol = 'http',
  }: SourceS3Options
) => {
  const { createNode } = actions

  const s3: S3 = createS3Instance({ accessKeyId, domain, secretAccessKey })
  const s3Entities = await fetchBucketItems(bucketName, s3)

  if (!s3Entities.length) {
    return []
  }

  return Promise.all(
    s3Entities.map(async (entity: S3.Object) => {
      const key = entity.Key
      if (!key) {
        return
      }

      const url = constructS3UrlForAsset({
        bucketName,
        domain,
        key,
        region,
        protocol,
      })

      if (!url) {
        return
      }

      return createS3AssetNode({
        createNode,
        createNodeId,
        createContentDigest,
        entity,
        url,
      })
    })
  )
}

export default sourceNodes
