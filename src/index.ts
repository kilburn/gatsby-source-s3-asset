import S3AssetNode from './types/S3AssetNode'

const loadNodeContent = (fileNode: object) => {
    return fs.readFile(fileNode.absolutePath, `utf-8`)
}

exports.loadNodeContent = loadNodeContent

export { S3AssetNode }
