import Mitm from 'mitm'
import configureMockStore from 'redux-mock-store'
import { sourceNodes } from '../source-nodes'
import fixtures_paging from './fixtures-paging.json'
import fixtures from './fixtures.json'

const ListObjectsMock = jest.fn()
const HeadObjectMock = jest.fn()
jest.mock('aws-sdk', () => ({
  S3: class {
    public listObjectsV2 = ListObjectsMock
    public headObject = HeadObjectMock
  },
}))

describe('Source S3Asset nodes.', () => {
  const nodes = {}

  const sourceNodeArgs = {
    actions: {
      createNode: jest.fn(node => (nodes[node.id] = node)),
      createParentChildLink: jest.fn(),
    },
    cache: {
      get: jest.fn(),
      set: jest.fn(),
    },
    createContentDigest: jest.fn(id => id),
    createNodeId: jest.fn(id => id),
    getNodes: jest.fn(),
    reporter: jest.fn(),
    store: {},
  }

  beforeAll(() => {
    Mitm().on('request', req => {
      const host = req.headers.host
      const url = req.url
      throw new Error(
        `Network requests forbidden in offline mode. Tried to call URL "${host}${url}"`
      )
    })
  })

  beforeEach(() => {
    sourceNodeArgs.store = configureMockStore()
    ListObjectsMock.mockReset()
  })

  test('Verify sourceNodes creates the correct # of nodes, given our fixtures.', async () => {
    ListObjectsMock.mockReturnValueOnce({
      promise: () => fixtures,
    })
    // NB: pulls from fixtures defined above, not S3 API.
    const entityNodes = await sourceNodes(sourceNodeArgs, {
      accessKeyId: 'fake-access-key',
      bucketName: 'fake-bucket',
      secretAccessKey: 'secret-access-key',
    })

    // 5 images + 2 directories = 7 nodes
    expect(entityNodes).toHaveLength(7)
    expect([...new Set(entityNodes.map(n => n.internal.type))]).toStrictEqual([
      'S3Asset',
    ])
  })

  test('Verify sourceNodes creates the correct # of nodes, given paging is required.', async () => {
    ListObjectsMock.mockReturnValueOnce({
      promise: () => fixtures_paging,
    }).mockReturnValueOnce({
      promise: () => fixtures,
    })

    // NB: pulls from fixtures defined above, not S3 API.
    const entityNodes = await sourceNodes(sourceNodeArgs, {
      accessKeyId: 'fake-access-key',
      bucketName: 'fake-bucket',
      secretAccessKey: 'secret-access-key',
    })

    // 10 images + 2 directories + 5 images
    expect(entityNodes).toHaveLength(17)
  })

  test('Verify sourceNodes creates the correct # of nodes, given no fixtures.', async () => {
    ListObjectsMock.mockReturnValueOnce({ promise: () => [] })
    // NB: pulls from fixtures defined above, not S3 API.
    const entityNodes = await sourceNodes(sourceNodeArgs, {
      accessKeyId: 'fake-access-key',
      bucketName: 'fake-bucket',
      secretAccessKey: 'secret-access-key',
    })

    expect(entityNodes).toHaveLength(0)
  })

  test('Verify sourceNodes fetches metadata when includeMetadata is true.', async () => {
    const metadata = { works: true }
    ListObjectsMock.mockReturnValueOnce({
      promise: () => fixtures,
    })
    HeadObjectMock.mockReturnValue({
      promise: () => Promise.resolve({ Metadata: metadata }),
    })

    // NB: pulls from fixtures defined above, not S3 API.
    const entityNodes = await sourceNodes(sourceNodeArgs, {
      accessKeyId: 'fake-access-key',
      bucketName: 'fake-bucket',
      secretAccessKey: 'secret-access-key',
      includeMetadata: true,
    })

    expect(entityNodes).toHaveLength(7)
    expect(HeadObjectMock).toHaveBeenCalledTimes(7)
    expect(entityNodes.map(n => n.Metadata)).toEqual(Array(7).fill(metadata))
  })
})
