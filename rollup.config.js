const terser = require('@rollup/plugin-terser');
const replace = require('@rollup/plugin-replace');
const version = require('./package.json').version;

const banner =
    '/*!\n' +
    ` * Strve Reactivity v${version}\n` +
    ` * (c) 2023-${new Date().getFullYear()} maomincoding\n` +
    ' * Released under the MIT License.\n' +
    ' */';

const config = {
    input: './lib/core.js',
    output: {
        banner,
        file: './dist/strve-reactivity.esm.js',
        format: 'esm',
    },
    plugins: [terser()],
};

const vars = {
    __VERSION__: version,
    preventAssignment: true
};
config['plugins'].push(replace(vars));

module.exports = config;
