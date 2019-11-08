import S3AssetNode from './types/S3AssetNode'

const fs = require('fs')

interface fileNode {
	absolutePath?: string
}

const loadNodeContent = (fileNode: fileNode) => {
    return fs.readFile(fileNode.absolutePath, (err) => {
  	if (err) throw err
    })
}

exports.loadNodeContent = loadNodeContent

export { S3AssetNode }
