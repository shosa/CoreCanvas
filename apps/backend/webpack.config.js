module.exports = function (options) {
  const externals = Array.isArray(options.externals)
    ? options.externals
    : options.externals
      ? [options.externals]
      : [];

  return {
    ...options,
    externals: [
      ...externals,
      { sharp: 'commonjs sharp' },
    ],
  };
};
