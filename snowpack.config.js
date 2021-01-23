module.exports = {
    mount: {
        src: '/dist',
    },
    optimize: {
        entrypoints: ['src/index.ts'],
        bundle: true,
        minify: true,
        target: 'es2018',
    },
    plugins: [['@snowpack/plugin-webpack']],
};
