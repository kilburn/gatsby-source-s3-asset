import { loadNodeContent } from '../index'
import S3AssetNode from '../types/S3AssetNode'

describe('loadContent interface.', () => {
  test('Verify sourceNodes creates the correct # of nodes, given paging is required.', async () => {
    const node: S3AssetNode = {
      id: 'fake',
      LastModified: new Date(),
      ETag: 'none',
      Key: '/of/asset.png',
      url: 'http://fake.url/of/asset.png',
      Metadata: {},
      internal: {
        mediaType: 'application/octet-stream',
        type: 'S3Asset',
      },
    }
    const content = loadNodeContent(node)
    expect(content).toBe('')
  })
})
