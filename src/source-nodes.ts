import { S3 } from 'aws-sdk'
import {
  constructS3UrlForAsset,
  createS3AssetNode,
  createS3Instance,
} from './utils'
import { S3Object } from './types/S3Object'

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
  // Public domain used to construct file URLs (useful if you are serving the
  // bucket's files through a CDN such as CloudFront)
  publicDomain?: string
  region?: string
  // Defaults to HTTP.
  protocol?: string
  // Defaults to false
  includeMetadata?: boolean
}

const fetchMetadata = (
  bucketName: string,
  includeMetadata: boolean,
  s3: S3,
  e: Pick<S3Object, 'Key' | 'ETag'>
): Promise<S3Object> =>
  !includeMetadata
    ? Promise.resolve({ ...e, Metadata: {} as { [k: string]: string } })
    : s3
        .headObject({
          Bucket: bucketName,
          Key: e.Key!,
        })
        .promise()
        .then(r => {
          return {
            ...e,
            Metadata: r.Metadata || {},
          }
        })
        .catch(() => {
          return {
            ...e,
            Metadata: {},
          }
        })

/**
 * Recursively fetches all items from the given bucket,
 * making multiple requests if necessary
 *
 * @param bucketName name of the bucket to fetch
 * @param includeMetadata whether to include objects' metadata or not (expensive!)
 * @param s3 s3 client to use
 */
const fetchBucketItems = async (
  bucketName: string,
  includeMetadata: boolean,
  s3: S3
) => {
  const s3Entities: S3Object[] = []
  let nextContinuationToken: undefined | string = undefined
  while (true) {
    const listObjectsResponse = await s3
      .listObjectsV2({
        Bucket: bucketName,
        ContinuationToken: nextContinuationToken,
      })
      .promise()

    const results = (listObjectsResponse.Contents || []) as S3.Object[]
    const entries = await Promise.all(
      results
        .filter((e: S3.Object) => !!e.Key)
        .map((e: S3.Object) =>
          fetchMetadata(bucketName, includeMetadata, s3, {
            Key: e.Key!,
            ETag: e.ETag!,
          })
        )
    )

    s3Entities.push(...entries)
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
    publicDomain,
    includeMetadata = false,
  }: SourceS3Options
) => {
  const { createNode } = actions

  const s3: S3 = createS3Instance({ accessKeyId, domain, secretAccessKey })
  const s3Entities = await fetchBucketItems(bucketName, includeMetadata, s3)

  if (!s3Entities.length) {
    return []
  }

  return Promise.all(
    s3Entities.map(async (entity: S3Object) => {
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
        publicDomain,
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
