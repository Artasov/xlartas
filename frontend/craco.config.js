const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    devServer: {
        allowedHosts: 'all', // Ensure all entries are non-empty strings
    },
    webpack: {
        alias: {
            Extra: path.resolve(__dirname, 'src/Extra/'),
            i18n: path.resolve(__dirname, 'src/i18n/'),
            Modules: path.resolve(__dirname, 'src/Modules/'),
            Redux: path.resolve(__dirname, 'src/Redux/'),
            Static: path.resolve(__dirname, 'src/Static/'),
            Types: path.resolve(__dirname, 'src/Types/'),
            UI: path.resolve(__dirname, 'src/UI/'),
            Utils: path.resolve(__dirname, 'src/Utils/'),
            Api: path.resolve(__dirname, 'src/Modules/Api/'),
            Auth: path.resolve(__dirname, 'src/Modules/Auth/'),
            Cabinet: path.resolve(__dirname, 'src/Modules/Cabinet/'),
            Chat: path.resolve(__dirname, 'src/Modules/Chat/'),
            Client: path.resolve(__dirname, 'src/Modules/Client/'),
            Company: path.resolve(__dirname, 'src/Modules/Company/'),
            Confirmation: path.resolve(__dirname, 'src/Modules/Confirmation/'),
            Core: path.resolve(__dirname, 'src/Modules/Core/'),
            Docs: path.resolve(__dirname, 'src/Modules/Docs/'),
            Landing: path.resolve(__dirname, 'src/Modules/Landing/'),
            Order: path.resolve(__dirname, 'src/Modules/Order/'),
            Payment: path.resolve(__dirname, 'src/Modules/Payment/'),
            TBank: path.resolve(__dirname, 'src/Modules/Software/'),
            Theme: path.resolve(__dirname, 'src/Modules/Theme/'),
            User: path.resolve(__dirname, 'src/Modules/User/'),
            xLMine: path.resolve(__dirname, 'src/Modules/xLMine/'),
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
