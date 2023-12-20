module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Required for expo-router
            'expo-router/babel',
        ],
        ignore: [
            // Add the path to the whitelist
            'node_modules/(?!(react-native-web/src))',
        ],
    };
};