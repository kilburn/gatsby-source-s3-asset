<p align="center">
  <a href="https://gatsbyjs.org">
    <img src="./assets/logo.svg" width="100" />
  </a>
</p>
<h1 align="center">
  gatsby-source-s3-asset
</h1>

[![CircleCI][circleci-badge]][circleci-link] [![npm][npm-badge]][npm-link]
[![Maintainability][codeclimate]][codeclimate 2]
[![codecov][codecov]][codecov 2]

## What is this?

`gatsby-source-s3-asset` is a [GatsbyJS][github] _Source_ plugin to
**obtain objects from any S3-compliant API[1] as GatsbyJS nodes**.

[1] This includes AWS S3, of course, as well as third-party solutions like
Digital Ocean Spaces, or open source / self-hosted products like [MinIO][min].

This plugin is based on [gatsby-source-s3-image][s3-image]. The major difference
is that this version does **not** download any files nor analyzes their contents
in any way. The goal is just to list assets and provide their publicly-accessible
URLs to gastby's internal GraphQL.

### But I can just query S3 manually client-side...

Sure, knock yourself out. But there are a few benefits you get out-of-the-box
with this package:

- Native integration with Gatsby's GraphQL data ontology, of course. You just
  provide the bucket details (and IAM credentials, if not public, which is
  recommended).

## Usage

### Setup

Add the dependency to your `package.json`:

```console
$ yarn add gatsby-source-s3-asset
$ # Or:
$ npm install --save gatsby-source-s3-asset
```

Next, register the plugin with the GatsbyJS runtime in the `plugins` field
exported from your `gatsby-config.js` file, filling in the values to point to
wherever your bucket is hosted:

```es6
const sourceS3 = {
  resolve: 'gatsby-source-s3-asset',
  options: {
    bucketName: 'jesse.pics',
    domain: null, // [optional] Not necessary to define for AWS S3; defaults to `s3.amazonaws.com`
    protocol: 'https', // [optional] Default to `https`.
    publicDomain: null, // [optional] Use this domain to construct the public URL for the assets
  },
}

const plugins = [
  sourceS3,
  // ...
]

module.exports = { plugins }
```

## Querying

As mentioned above, `gatsby-source-s3-asset` exposes nodes of type
`S3Asset`:

```typescript
interface S3AssetNode {
  id: string
  LastModified: Date
  ETag: string
  Key: string
  internal: {
    content: string
    contentDigest: string
    mediaType: string
    type: string
  }
}
```

## _Nota Bene:_ Gatsby Version Compatibility

`gatsby-source-s3-asset` is compatible only with Gatsby V2,

[circleci-badge]: https://circleci.com/gh/kilburn/gatsby-source-s3-asset.svg?style=shield
[circleci-link]: https://circleci.com/gh/kilburn/gatsby-source-s3-asset
[codeclimate]: https://api.codeclimate.com/v1/badges/4488634e45e84d3cbdbe/maintainability
[codeclimate 2]: https://codeclimate.com/github/kilburn/gatsby-source-s3-asset/maintainability
[codecov]: https://codecov.io/gh/kilburn/gatsby-source-s3-asset/branch/master/graph/badge.svg
[codecov 2]: https://codecov.io/gh/kilburn/gatsby-source-s3-asset
[github]: https://github.com/gatsbyjs/gatsby
[s3-image]: https://github.com/jessestuart/gatsby-source-s3-image
[min]: https://min.io
[npm-badge]: https://img.shields.io/npm/v/gatsby-source-s3-asset.svg
[npm-link]: https://www.npmjs.com/package/gatsby-source-s3-asset
