const path = require('path');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        server: './server/index.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },
                exclude: /(node_modules)/
            }, {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'ssr',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    externals: [{ "@steedos/objectql":true}, "graphql-request", 
        "express", "fs", "path", "underscore", "cross-fetch", 
        "react", "react-dom/server", "react-router", "react-router-dom", "react-router-config", "body-parser"]
};