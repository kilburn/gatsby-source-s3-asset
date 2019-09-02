module.exports = {
  compact: true,
  comments: false,
  sourceRoot: 'src/',
  ignore: ['./src/__tests__/*'],
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-object-rest-spread',
  ],
}
