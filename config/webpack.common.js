const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: path.resolve(__dirname, "../src/client", "index.js"),
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, '../dist'),
        publicPath: "/"
    },
    devServer: {
        port: 3000,
        open: true,
        proxy: {
          '/api': 'http://localhost:8080'
        },
        historyApiFallback: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: [/node_modules/],
                use: [{ loader: "babel-loader" }]
            },
            {
                test: /.*\.(gif|png|jp(e*)g|svg)$/i,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 21000,
                            name: "images/[name]_[hash:7].[ext]"
                        }
                    }
                ]
            },
            // Vendor CSS loader
            // This is necessary to pack third party libraries like antd
            {
                test: /\.css$/,
                include: path.resolve(__dirname, '../node_modules'),
                use: [
                'style-loader',
                ],
            },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, '../public', 'index.html'),
        }),
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    },
}