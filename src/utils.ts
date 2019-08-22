import { S3 } from 'aws-sdk'
import invariant from 'invariant'
import mime from 'mime'
import NodeFields from './types/EntityNode'

// =========================
// Plugin-specific constants.
// =========================
export const S3SourceGatsbyNodeType = 'S3Asset'

/**
 * Instantiate a new instance of the S3 API SDK.
 */
export const createS3Instance = ({ accessKeyId, domain, secretAccessKey }) =>
  new S3({
    accessKeyId,
    apiVersion: '2006-03-01',
    endpoint: domain,
    s3ForcePathStyle: true,
    secretAccessKey,
    signatureVersion: 'v4',
  })

export const getNodeFields = (entity: S3.Object, url: string): NodeFields => {
  const { ETag, Key } = entity
  invariant(Key, 'Entity Key must be defined.')

  // Remove obnoxious escaped double quotes in S3 object's ETag. For reference:
  // > The entity tag is a hash of the object. The ETag reflects changes only
  // > to the contents of an object, not its metadata.
  // @see https://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonResponseHeaders.html
  return {
    Key: Key!,
    ETag: ETag!.replace(/"/g, ''),
    url,
  }
}

export const constructS3UrlForAsset = ({
  bucketName,
  domain,
  region,
  publicDomain,
  key,
  protocol = 'https',
}: {
  bucketName: string
  domain: string
  publicDomain?: string
  region?: string
  key: string
  protocol?: string
}): string => {
  // Both `key` and either one of `bucketName` or `domain` are required.
  const areParamsValid = key && (publicDomain || bucketName || domain)
  if (!areParamsValid) {
    throw new Error('Unable to construct S3 URL for asset: invalid params.')
  }

  if (publicDomain) {
    return `${protocol}://${publicDomain}/${key}`
  }

  // If `domain` is not defined, we assume we're referring to AWS S3.
  // If it *is*, assume we're pointing to a third-party implementation of the
  // protocol (e.g., Minio, Digital Ocean Spaces, OpenStack Swift, etc).
  const isAWS: boolean = domain.includes('amazonaws.com')
  return isAWS
    ? `${protocol}://${bucketName}.s3.${region}.amazonaws.com/${key}`
    : `${protocol}://${domain}/${bucketName}/${key}`
}

export const createS3AssetNode = ({
  createNode,
  createNodeId,
  createContentDigest,
  entity,
  url,
}: {
  createNode: Function
  createNodeId: (objectHash: string) => string
  createContentDigest: (content: object) => string
  entity: S3.Object
  url: string
}) => {
  const nodeData = getNodeFields(entity, url)

  return createNode({
    ...nodeData,
    id: createNodeId(`s3-image-${entity.Key}`),
    parent: null,
    children: [],
    internal: {
      contentDigest: createContentDigest(nodeData),
      mediaType: mime.getType(nodeData.Key) || 'application/octet-stream',
      type: S3SourceGatsbyNodeType,
      description: `Node for s3 file ${entity.Key}`,
    },
  })
}
