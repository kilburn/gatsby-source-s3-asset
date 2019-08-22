import { GraphQLString } from 'gatsby/graphql'
import { S3SourceGatsbyNodeType } from './utils'

interface ExtendNodeTypeOptions {
  type: {
    name: string
  }
}

export default ({ type }: ExtendNodeTypeOptions) => {
  if (type.name !== S3SourceGatsbyNodeType) {
    return Promise.resolve()
  }

  return Promise.resolve({
    ETag: { type: GraphQLString },
    Key: { type: GraphQLString },
    mimeType: { type: GraphQLString },
  })
}
