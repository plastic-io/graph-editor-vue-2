module.exports = { // eslint-disable-line
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "node": "current"
                }
            }
        ],
        "@vue/cli-plugin-babel/preset",
        "@babel/preset-typescript"
    ]
};