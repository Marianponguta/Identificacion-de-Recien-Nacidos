module.exports = function override(config, env) {
  // Find the source-map-loader rule
  const sourceMapLoaderRule = config.module.rules
    .find(rule => rule.oneOf)
    .oneOf
    .find(rule => rule.use && rule.use.some && rule.use.some(use => use && use.loader && use.loader.includes('source-map-loader')));

  // If the source-map-loader rule is found, add an exclude function for html5-qrcode
  if (sourceMapLoaderRule) {
    sourceMapLoaderRule.exclude = [
      /node_modules\/html5-qrcode/, 
      ...(Array.isArray(sourceMapLoaderRule.exclude) ? sourceMapLoaderRule.exclude : [sourceMapLoaderRule.exclude].filter(Boolean))
    ];
  }

  return config;
};
