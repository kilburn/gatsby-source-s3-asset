import S3AssetNode from './types/S3AssetNode'

/**
 * (Does not) load an asset's actual data.
 *
 * @param node Node whose contents should be loaded.
 */
export const loadNodeContent = (node: S3AssetNode) => {
  console.warn(`Warning: gatsby-source-s3-asset does not download node contents.

    This probably happened because some transformer plugin such as 
    gatsby-transformer-remark is trying to parse the contents of the asset
    at URL ${node.url}.

    If you want S3 assets to be further processed you must use another plugin
    that actually downloads the files to your local system.
    `)
  return ''
}
