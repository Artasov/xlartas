const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    devServer: {
        allowedHosts: 'all', // Ensure all entries are non-empty strings
    },
    webpack: {
        alias: {
            Static: path.resolve(__dirname, 'src/Static/'),
            Types: path.resolve(__dirname, 'src/Types/'),
            Redux: path.resolve(__dirname, 'src/Redux/'),
            Utils: path.resolve(__dirname, 'src/Utils/'),
            WideLayout: path.resolve(__dirname, 'src/WideLayout/'),
            Auth: path.resolve(__dirname, 'src/Modules/Auth/'),
            Company: path.resolve(__dirname, 'src/Modules/Company/'),
            TBank: path.resolve(__dirname, 'src/Modules/TBank/'),
            Extra: path.resolve(__dirname, 'src/Modules/Extra/'),
            Landing: path.resolve(__dirname, 'src/Modules/Landing/'),
            Cabinet: path.resolve(__dirname, 'src/Modules/Cabinet/'),
            Chat: path.resolve(__dirname, 'src/Modules/Chat/'),
            Docs: path.resolve(__dirname, 'src/Modules/Docs/'),
            Confirmation: path.resolve(__dirname, 'src/Modules/Confirmation/'),
            Core: path.resolve(__dirname, 'src/Modules/Core/'),
            Order: path.resolve(__dirname, 'src/Modules/Order/'),
            Theme: path.resolve(__dirname, 'src/Modules/Theme/'),
            User: path.resolve(__dirname, 'src/Modules/User/'),
            Survey: path.resolve(__dirname, 'src/Modules/surveys/'),
            FileHost: path.resolve(__dirname, 'src/Modules/filehost/'),
            Shop: path.resolve(__dirname, 'src/Modules/shop/'),
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    memoryLimit: 4096,
                },
            }),
        ],
    },
};
