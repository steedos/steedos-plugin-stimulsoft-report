var path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/ssr-browser.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'ssr-browser.js',
        library: 'ssrBrowser',
        libraryTarget: "window"
    }
};
